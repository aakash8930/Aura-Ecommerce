import { z } from "zod";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { requireAuth } from "../middleware/auth";
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  refreshExpiry,
} from "../lib/jwt";
import { badRequest, unauthorized, conflict } from "../lib/errors";
import { config } from "../config";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function issueTokens(userId: string, email: string, role: "USER" | "ADMIN", req: { headers: any; ip?: string }) {
  const access = signAccessToken({ sub: userId, email, role });
  const { token: refresh, hash } = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hash,
      expiresAt: refreshExpiry(),
      userAgent: String(req.headers["user-agent"] ?? "").slice(0, 200),
      ip: req.ip,
    },
  });
  return { accessToken: access, refreshToken: refresh };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, name } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw conflict("Email already registered");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: "USER" },
    });
    const tokens = await issueTokens(user.id, user.email, user.role as "USER" | "ADMIN", req);
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw unauthorized("Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw unauthorized("Invalid credentials");
    const tokens = await issueTokens(user.id, user.email, user.role as "USER" | "ADMIN", req);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
      ...tokens,
    });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const hash = hashToken(refreshToken);
    const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hash }, include: { user: true } });
    if (!record || record.revokedAt || record.expiresAt < new Date()) throw unauthorized("Invalid refresh token");

    // Rotate
    await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    const tokens = await issueTokens(record.user.id, record.user.email, record.user.role as "USER" | "ADMIN", req);
    res.json({
      user: { id: record.user.id, email: record.user.email, name: record.user.name, role: record.user.role, avatarUrl: record.user.avatarUrl },
      ...tokens,
    });
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const { refreshToken } = z.object({ refreshToken: z.string().optional() }).parse(req.body);
    if (refreshToken) {
      const hash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({ where: { tokenHash: hash, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    res.json({ ok: true });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw unauthorized();
    res.json({ user });
  })
);

router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = z.object({ name: z.string().min(1).max(80).optional() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });
    res.json({ user });
  })
);

router.post(
  "/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = z
      .object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) })
      .parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user?.passwordHash) throw badRequest("No password set on this account");
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw unauthorized("Current password incorrect");
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 10) } });
    res.json({ ok: true });
  })
);

// ─── Google OAuth ────────────────────────────────────

router.get("/google", (_req, res) => {
  if (!config.google.enabled) return res.status(501).json({ error: "Google OAuth not configured" });
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get(
  "/google/callback",
  asyncHandler(async (req, res) => {
    if (!config.google.enabled) return res.status(501).json({ error: "Google OAuth not configured" });
    const code = String(req.query.code ?? "");
    if (!code) throw badRequest("Missing code");

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw badRequest("Token exchange failed");
    const tokenJson = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      id_token: string;
    };

    // Fetch profile
    const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (!profileRes.ok) throw badRequest("Failed to fetch Google profile");
    const profile = (await profileRes.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    };

    // Upsert user
    let oauth = await prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: profile.sub } },
      include: { user: true },
    });

    let user = oauth?.user;
    if (!user) {
      user = await prisma.user.upsert({
        where: { email: profile.email },
        update: { name: profile.name ?? undefined, avatarUrl: profile.picture ?? undefined },
        create: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.picture,
          emailVerified: new Date(),
        },
      });
      await prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: "google",
          providerAccountId: profile.sub,
          accessToken: tokenJson.access_token,
          refreshToken: tokenJson.refresh_token,
          expiresAt: Math.floor(Date.now() / 1000) + tokenJson.expires_in,
        },
      });
    }

    const tokens = await issueTokens(user.id, user.email, user.role as "USER" | "ADMIN", req);

    // Bounce back to frontend with tokens in URL hash
    const url = new URL(`${config.appUrl}/auth/callback`);
    url.hash = new URLSearchParams({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }).toString();
    res.redirect(url.toString());
  })
);

export default router;
