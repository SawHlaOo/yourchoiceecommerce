import express from "express";
import { auth } from "../middlewares/auth.js";
import { usersController } from "../controllers/usersController.js";
import { validateBody, validateParams } from "../middlewares/validate.js";
import { loginSchema, registrationSchema } from "../lib/dtos_users.js";
import { deprecatedHandler } from "../lib/compat.js";
import { requireAdmin } from "../middlewares/authorization.js";
import { z } from "zod";

export const router = express.Router();

const userIdParams = z.object({ id: z.coerce.number().int().positive() });

router.get("/verify", auth, usersController.verify);
router.post("/login", validateBody(loginSchema), usersController.login);
router.post("/users", validateBody(registrationSchema), usersController.register);
// Deprecated convenience route mapped to new /users route
router.post(
  "/register",
  deprecatedHandler((req, res, next) => usersController.register(req, res), "Deprecated endpoint: use POST /users instead")
);
router.delete("/users/:id", auth, requireAdmin, validateParams(userIdParams), usersController.deleteUser);
