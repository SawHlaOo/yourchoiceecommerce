import express from "express";
import { auth } from "../middlewares/auth.js";
import { validateBody, validateParams } from "../middlewares/validate.js";
import { commerceController } from "../controllers/commerceController.js";
import { z } from "zod";

export const router = express.Router();
const productIdSchema = z.object({ productId: z.coerce.number().int().positive() });
const cartSchema = z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive().max(99).optional() });

router.get("/cart", auth, commerceController.cart);
router.post("/cart", auth, validateBody(cartSchema), commerceController.addCart);
router.delete("/cart/:productId", auth, validateParams(productIdSchema), commerceController.removeCart);
router.get("/wishlist", auth, commerceController.wishlist);
router.post("/wishlist/:productId", auth, validateParams(productIdSchema), commerceController.addWishlist);
router.delete("/wishlist/:productId", auth, validateParams(productIdSchema), commerceController.removeWishlist);
