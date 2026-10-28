import type { RequestHandler } from "express";
import { z } from "zod";
import { createProductCardSchema, updateProductCardSchema } from "../lib/dtos_productCards.js";
import { productCardsService } from "../services/productCardsService.js";

const idFrom = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const listQuerySchema = z.object({
  category: z.string().trim().min(1).max(60).regex(/^[a-zA-Z0-9 &()/-]+$/).optional(),
  page: z.coerce.number().int().min(1).max(200).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  summary: z.enum(["true", "false", "1", "0"]).optional(),
});

const slugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const productCardsController = {
  list: (async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    return res.json({ success: true, data: await productCardsService.list(query.category) });
  }) as RequestHandler,
  listAdmin: (async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    const summary = query.summary === "true" || query.summary === "1";
    const products = summary ? await productCardsService.listAdminSummary() : await productCardsService.listAdmin();
    return res.json({ success: true, data: products });
  }) as RequestHandler,
  get: (async (req, res) => {
    const id = idFrom(String(req.params.id));
    if (!id) return res.status(400).json({ success: false, error: "Invalid product id" });
    const product = await productCardsService.get(id);
    return product ? res.json({ success: true, data: product }) : res.status(404).json({ success: false, error: "Product not found" });
  }) as RequestHandler,
  getBySlug: (async (req, res) => {
    const parsed = slugParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Invalid product slug" });
    }
    const product = await productCardsService.getBySlug(parsed.data.slug);
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
