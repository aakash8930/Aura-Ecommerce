import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from "../lib/jwt";
import { unauthorized, forbidden } from "../lib/errors";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function readBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (h?.startsWith("Bearer ")) return h.slice(7);
  return null;
}

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) return next();
  try {
    req.user = verifyAccessToken(token);
  } catch {
    /* ignore — treat as anonymous */
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw unauthorized();
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw unauthorized();
  if (req.user.role !== "ADMIN") throw forbidden("Admin only");
  next();
}
