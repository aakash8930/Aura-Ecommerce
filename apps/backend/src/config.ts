import dotenv from "dotenv";
import path from "path";

const ROOT = path.resolve(__dirname, "../../..");

// Load root .env (single source of truth for all 3 apps)
dotenv.config({ path: path.join(ROOT, ".env") });

// SQLite paths in .env are written relative to the repo root for portability —
// rewrite to absolute so the resolved path is independent of process cwd.
if (process.env.DATABASE_URL?.startsWith("file:./")) {
  const rel = process.env.DATABASE_URL.replace(/^file:\.\//, "");
  process.env.DATABASE_URL = `file:${path.join(ROOT, rel)}`;
}

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",

  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL ?? "http://localhost:5173",
  apiUrl: process.env.API_URL ?? "http://localhost:4000",

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret"),
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? "15m",
    refreshExpiresDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? 30),
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:4000/api/auth/google/callback",
    enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    enabled: Boolean(process.env.STRIPE_SECRET_KEY),
  },
} as const;
