import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/errors";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation error", details: err.flatten() });
  }
  console.error("[error]", err);
  return res.status(500).json({ error: "Internal server error" });
}

export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => unknown>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
