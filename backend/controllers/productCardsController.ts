import type { RequestHandler } from "express";
import { createProductCardSchema, updateProductCardSchema } from "../lib/dtos_productCards.js";
import { productCardsService } from "../services/productCardsService.js";

const idFrom = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const productCardsController = {
  list: (async (req, res) => res.json({ success: true, data: await productCardsService.list(typeof req.query.category === "string" ? req.query.category : undefined) })) as RequestHandler,
  listAdmin: (async (_req, res) => res.json({ success: true, data: await productCardsService.listAdmin() })) as RequestHandler,
  get: (async (req, res) => {
    const id = idFrom(String(req.params.id));
    if (!id) return res.status(400).json({ success: false, error: "Invalid product id" });
    const product = await productCardsService.get(id);
    return product ? res.json({ success: true, data: product }) : res.status(404).json({ success: false, error: "Product not found" });
  }) as RequestHandler,
  getBySlug: (async (req, res) => {
    const product = await productCardsService.getBySlug(String(req.params.slug));
    return product ? res.json({ success: true, data: product }) : res.status(404).json({ success: false, error: "Product not found" });
  }) as RequestHandler,
  create: (async (req, res) => res.status(201).json({ success: true, data: await productCardsService.create(req.body) })) as RequestHandler,
  update: (async (req, res) => {
    const id = idFrom(String(req.params.id));
    if (!id) return res.status(400).json({ success: false, error: "Invalid product id" });
    return res.json({ success: true, data: await productCardsService.update(id, req.body) });
  }) as RequestHandler,
  deactivate: (async (req, res) => {
    const id = idFrom(String(req.params.id));
    if (!id) return res.status(400).json({ success: false, error: "Invalid product id" });
    return res.json({ success: true, data: await productCardsService.deactivate(id) });
  }) as RequestHandler,
  delete: (async (req, res) => {
    const id = idFrom(String(req.params.id));
    if (!id) return res.status(400).json({ success: false, error: "Invalid product id" });
    await productCardsService.delete(id);
    return res.status(204).send();
  }) as RequestHandler,
  schemas: { createProductCardSchema, updateProductCardSchema },
};
