import type { RequestHandler } from "express";

export type AuthenticatedUser = {
  id: number;
  role?: string;
};

const hasRole = (user: unknown, allowedRoles: readonly string[]) => {
  if (!user || typeof user !== "object") return false;
  const role = (user as { role?: unknown }).role;
  return typeof role === "string" && allowedRoles.includes(role);
};

export const requireAdmin: RequestHandler = (_req, res, next) => {
  const user = res.locals.user as AuthenticatedUser | undefined;
  if (!hasRole(user, ["ADMIN"])) {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }
  return next();
};

export const requireAnyRole = (roles: readonly string[]): RequestHandler => (_req, res, next) => {
  const user = res.locals.user as AuthenticatedUser | undefined;
  if (!hasRole(user, roles)) {
    return res.status(403).json({ success: false, error: "Insufficient permissions" });
  }
  return next();
};

export const requireSelfOrAdmin = (paramName = "id"): RequestHandler => (req, res, next) => {
  const user = res.locals.user as AuthenticatedUser | undefined;
  const requestedId = Number(req.params[paramName]);
  if (user?.role === "ADMIN" || user?.id === requestedId) {
    return next();
  }
  return res.status(403).json({ success: false, error: "Forbidden" });
};
