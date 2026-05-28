import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
}

export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(48).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + config.jwt.refreshExpiresDays);
  return d;
}
