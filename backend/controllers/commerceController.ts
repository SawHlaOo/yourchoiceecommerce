import type { RequestHandler } from "express";
import { z } from "zod";
import { commerceRepository } from "../repositories/commerceRepository.js";

const itemSchema = z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive().max(99).optional() });
const productIdSchema = z.object({ productId: z.coerce.number().int().positive() });
const userId = (res: Parameters<RequestHandler>[1]) => Number((res.locals.user as { id?: number }).id);
const productStatusError = (message: string, status = 409) => Object.assign(new Error(message), { status });

export const commerceController = {
  cart: (async (_req, res) => res.json({ success: true, data: await commerceRepository.listCart(userId(res)) })) as RequestHandler,
  addCart: (async (req, res) => {
    const parsed = itemSchema.parse(req.body);
    const product = await commerceRepository.findProduct(parsed.productId);
    if (!product) throw productStatusError("Product not found", 404);
    if (!product.isActive) throw productStatusError("Product is no longer active");
    const existingCartItem = await commerceRepository.findCartItem(userId(res), parsed.productId);
    if (product.stock < (existingCartItem?.quantity ?? 0) + (parsed.quantity ?? 1)) throw productStatusError("Product does not have enough stock");
    return res.status(201).json({ success: true, data: await commerceRepository.addCart(userId(res), parsed.productId, parsed.quantity ?? 1) });
  }) as RequestHandler,
  removeCart: (async (req, res) => {
    const parsed = productIdSchema.parse(req.params);
    await commerceRepository.removeCart(userId(res), parsed.productId);
    return res.json({ success: true });
  }) as RequestHandler,
  wishlist: (async (_req, res) => res.json({ success: true, data: await commerceRepository.listWishlist(userId(res)) })) as RequestHandler,
  addWishlist: (async (req, res) => {
    const parsed = productIdSchema.parse(req.params);
    const product = await commerceRepository.findProduct(parsed.productId);
    if (!product) throw productStatusError("Product not found", 404);
    return res.status(201).json({ success: true, data: await commerceRepository.addWishlist(userId(res), parsed.productId) });
  }) as RequestHandler,
  removeWishlist: (async (req, res) => {
    const parsed = productIdSchema.parse(req.params);
    await commerceRepository.removeWishlist(userId(res), parsed.productId);
    return res.json({ success: true });
  }) as RequestHandler,
};
