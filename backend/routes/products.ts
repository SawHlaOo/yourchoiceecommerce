import express from "express";
import { auth } from "../middlewares/auth.js";
import { productsController } from "../controllers/productsController.js";
import { validateBody } from "../middlewares/validate.js";
import { createProductSchema, editProductSchema } from "../lib/dtos_products.js";
import { deprecatedHandler } from "../lib/compat.js";
import { productCardsController } from "../controllers/productCardsController.js";
import { requireAdmin } from "../middlewares/authorization.js";
import { validateParams } from "../middlewares/validate.js";
import { z } from "zod";

export const router = express.Router();

const productIdParams = z.object({ id: z.coerce.number().int().positive() });

router.get("/products", productCardsController.list);
router.get("/products/slug/:slug", productCardsController.getBySlug);
router.get("/products/:id", validateParams(productIdParams), productCardsController.get);
router.get("/admin/products", auth, requireAdmin, productCardsController.listAdmin);
router.post("/products", auth, requireAdmin, validateBody(productCardsController.schemas.createProductCardSchema), productCardsController.create);
router.patch("/products/:id", auth, requireAdmin, validateParams(productIdParams), validateBody(productCardsController.schemas.updateProductCardSchema), productCardsController.update);
router.delete("/products/:id", auth, requireAdmin, validateParams(productIdParams), productCardsController.deactivate);

router.get("/games", productsController.listGames);
router.get("/games/:id", productsController.getGame);
// deprecated singular route mapped to /games/:id
router.get(
  "/game/:id",
  deprecatedHandler((req, res, next) => productsController.getGame(req, res), "Deprecated endpoint: use GET /games/:id instead")
);

router.get("/apps", productsController.listApps);
router.get("/apps/:id", productsController.getApp);
router.get("/powerpoints", productsController.listPowerPoints);
router.get("/powerpoints/:id", productsController.getPowerPoint);

router.post("/games", auth, validateBody(createProductSchema), productsController.createGame);
router.patch("/games/:id", auth, validateBody(editProductSchema), productsController.updateGame);
router.delete("/games/:id", auth, productsController.deleteGame);

router.post("/apps", auth, validateBody(createProductSchema), productsController.createApp);
router.patch("/apps/:id", auth, validateBody(editProductSchema), productsController.updateApp);
router.delete("/apps/:id", auth, productsController.deleteApp);

router.post("/powerpoints", auth, validateBody(createProductSchema), productsController.createPowerPoint);
router.patch("/powerpoints/:id", auth, validateBody(editProductSchema), productsController.updatePowerPoint);
router.delete("/powerpoints/:id", auth, productsController.deletePowerPoint);
