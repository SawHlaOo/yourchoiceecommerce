import type { RequestHandler } from "express";

export const requireAdmin: RequestHandler = (_req, res, next) => {
  const user = res.locals.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }
  return next();
};
