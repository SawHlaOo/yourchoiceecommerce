import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

import { auth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/authorization.js";
import { validateBody, validateParams } from "../middlewares/validate.js";
import { signJwt, verifyJwt } from "../lib/jwt.js";

process.env.JWT_SECRET ??= "abcdefghijklmnopqrstuvwxyz1234567890";

function makeRes() {
  return {
    statusCode: 200,
    body: undefined as any,
    locals: {} as Record<string, unknown>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

test("jwt helper verifies a signed token without dropping the payload", () => {
  const token = signJwt({ id: 42, role: "ADMIN" });
  const payload = verifyJwt(token);

  assert.equal(typeof payload, "object");
  assert.ok(payload && "id" in payload && payload.id === 42);
  assert.ok(payload && "role" in payload && payload.role === "ADMIN");
});

test("auth middleware rejects missing or malformed bearer tokens", () => {
  const res = makeRes();
  let called = false;

  auth({ headers: {} } as any, res as any, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, "Missing bearer token");

  const resTwo = makeRes();
  let calledTwo = false;
  auth({ headers: { authorization: "Token abc123" } } as any, resTwo as any, () => {
    calledTwo = true;
  });

  assert.equal(calledTwo, false);
  assert.equal(resTwo.statusCode, 401);
  assert.equal(resTwo.body.error, "Invalid authorization header");
});

test("auth middleware accepts a signed token and stores the user payload", () => {
  const token = signJwt({ id: 12, role: "USER" });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = makeRes();
  let nextCalled = false;

  auth(req as any, res as any, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.locals.user && (res.locals.user as any).id, 12);
  assert.equal(res.locals.user && (res.locals.user as any).role, "USER");
});

test("requireAdmin blocks non-admin users and allows admins", () => {
  const notAdminRes = makeRes();
  notAdminRes.locals.user = { id: 5, role: "USER" };
  let called = false;

  requireAdmin({ params: {} } as any, notAdminRes as any, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(notAdminRes.statusCode, 403);
  assert.equal(notAdminRes.body.error, "Admin access required");

  const adminRes = makeRes();
  adminRes.locals.user = { id: 9, role: "ADMIN" };
  let allowed = false;

  requireAdmin({ params: {} } as any, adminRes as any, () => {
    allowed = true;
  });

  assert.equal(allowed, true);
});

test("validation middleware rejects injection-like payloads and invalid ids", () => {
  const schema = z.object({
    name: z.string().trim().regex(/^[a-zA-Z0-9 _-]+$/),
    category: z.enum(["games", "apps"]).optional(),
  });

  const bodyRes = makeRes();
  const bodyReq = { body: { name: "'; DROP TABLE users; --", category: "games" } };

  validateBody(schema)(bodyReq as any, bodyRes as any, () => {
    throw new Error("Unexpected success");
  });

  assert.equal(bodyRes.statusCode, 400);
  assert.equal(bodyRes.body.error, "Validation failed");

  const paramRes = makeRes();
  const paramReq = { params: { id: "0" } };

  validateParams(z.object({ id: z.coerce.number().int().positive() }))(paramReq as any, paramRes as any, () => {
    throw new Error("Unexpected success");
  });

  assert.equal(paramRes.statusCode, 400);
  assert.equal(paramRes.body.error, "Validation failed");
});
