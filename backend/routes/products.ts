import express from "express";
import { z } from "zod";
import { auth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/authorization.js";
import { validateBody, validateParams } from "../middlewares/validate.js";
import { productCardsController } from "../controllers/productCardsController.js";

export const router = express.Router();

const productIdParams = z.object({ id: z.string().min(1) });

router.get("/products", productCardsController.list);
router.get("/products/slug/:slug", productCardsController.getBySlug);
router.get("/products/:id", validateParams(productIdParams), productCardsController.get);
router.get("/admin/products", auth, requireAdmin, productCardsController.listAdmin);
router.post("/products", auth, requireAdmin, validateBody(productCardsController.schemas.createProductCardSchema), productCardsController.create);
router.patch("/products/:id", auth, requireAdmin, validateParams(productIdParams), validateBody(productCardsController.schemas.updateProductCardSchema), productCardsController.update);
router.delete("/products/:id", auth, requireAdmin, validateParams(productIdParams), productCardsController.deactivate);
router.delete("/products/:id/permanent", auth, requireAdmin, validateParams(productIdParams), productCardsController.delete);
