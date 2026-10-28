import express from "express";
import { auth } from "../middlewares/auth.js";
import { featureFlagsController } from "../controllers/featureFlagsController.js";
import { validateBody, validateParams } from "../middlewares/validate.js";
import { flagSchema } from "../lib/dtos_featureFlags.js";
import { requireAdmin } from "../middlewares/authorization.js";
import { z } from "zod";

export const router = express.Router();

const isDev = process.env.NODE_ENV !== "production";
const flagKeyParams = z.object({ key: z.string().trim().min(2).regex(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/) });

router.get("/feature-flags", featureFlagsController.listFlags);
router.get("/feature-flags/:key", validateParams(flagKeyParams), featureFlagsController.getFlag);
router.post("/feature-flags", auth, requireAdmin, validateBody(flagSchema), featureFlagsController.createFlag);
router.patch("/feature-flags/:key", auth, requireAdmin, validateParams(flagKeyParams), validateBody(flagSchema.partial()), featureFlagsController.updateFlag);
router.delete("/feature-flags/:key", auth, requireAdmin, validateParams(flagKeyParams), featureFlagsController.deleteFlag);

if (isDev) {
  router.post("/dev/feature-flags", validateBody(flagSchema), featureFlagsController.createFlagDev);
  router.patch("/dev/feature-flags/:key", validateParams(flagKeyParams), validateBody(flagSchema.partial()), featureFlagsController.updateFlagDev);
  router.delete("/dev/feature-flags/:key", validateParams(flagKeyParams), featureFlagsController.deleteFlagDev);
}
