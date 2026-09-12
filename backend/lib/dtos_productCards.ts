import { z } from "zod";

const money = z.number().finite().nonnegative();
const productFields = {
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  image: z.string().trim().refine((value) => /^https?:\/\//i.test(value) || /^data:image\/(png|jpeg|webp);base64,/i.test(value), "Image must be a valid URL or uploaded image"),
  price: money,
  originalPrice: money.optional(),
  brand: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  stock: z.number().int().nonnegative(),
  badge: z.string().trim().optional(),
  isActive: z.boolean().optional(),
};

export const createProductCardSchema = z.object(productFields).superRefine((value, ctx) => {
  if (value.originalPrice !== undefined && value.originalPrice < value.price) {
    ctx.addIssue({ code: "custom", path: ["originalPrice"], message: "Original price must be at least the current price" });
  }
});

export const updateProductCardSchema = z.object(productFields).partial().superRefine((value, ctx) => {
  if (value.originalPrice !== undefined && value.price !== undefined && value.originalPrice < value.price) {
    ctx.addIssue({ code: "custom", path: ["originalPrice"], message: "Original price must be at least the current price" });
  }
});
