import express from "express";
import { verifyJwt } from "../lib/jwt.js";

export function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authorization = req.headers.authorization;

  if (typeof authorization !== "string") {
    return res.status(401).json({ success: false, error: "Missing bearer token" });
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  if (!match) {
    return res.status(401).json({ success: false, error: "Invalid authorization header" });
  }

  const token = match[1].trim();
  if (!token) {
    return res.status(401).json({ success: false, error: "Missing bearer token" });
  }

  try {
    const payload = verifyJwt(token);

    if (typeof payload !== "object" || payload === null || !("id" in payload)) {
      return res.status(401).json({ success: false, error: "Invalid token payload" });
    }

    res.locals.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}