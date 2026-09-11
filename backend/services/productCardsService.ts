import { Prisma } from "../lib/prisma.js";
import { productCardsRepository } from "../repositories/productCardsRepository.js";

type ProductInput = {
  name: string;
  description?: string;
  image: string;
  price: number;
  originalPrice?: number;
  brand?: string;
  category?: string;
  slug?: string;
  stock: number;
  badge?: string;
  isActive?: boolean;
};

function toResponse(product: Awaited<ReturnType<typeof productCardsRepository.findById>>) {
  if (!product) return product;
  const price = Number(product.price);
  const originalPrice = product.originalPrice === null ? null : Number(product.originalPrice);
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  return { ...product, image: product.thumbnail, price, originalPrice, discount };
}

function toCreateData(input: ProductInput): Prisma.ProductCardCreateInput {
  return {
    name: input.name,
    description: input.description,
    thumbnail: input.image,
    price: new Prisma.Decimal(input.price),
    originalPrice: input.originalPrice === undefined ? null : new Prisma.Decimal(input.originalPrice),
    brand: input.brand,
    category: input.category,
    slug: input.slug,
    stock: input.stock,
    badge: input.badge,
    isActive: input.isActive ?? true,
  };
}

function toUpdateData(input: Partial<ProductInput>): Prisma.ProductCardUpdateInput {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.image !== undefined ? { thumbnail: input.image } : {}),
    ...(input.price !== undefined ? { price: new Prisma.Decimal(input.price) } : {}),
    ...(input.originalPrice !== undefined ? { originalPrice: input.originalPrice === null ? null : new Prisma.Decimal(input.originalPrice) } : {}),
    ...(input.brand !== undefined ? { brand: input.brand } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.stock !== undefined ? { stock: input.stock } : {}),
    ...(input.badge !== undefined ? { badge: input.badge } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  };
}

export const productCardsService = {
  async list(category?: string) {
    const products = await productCardsRepository.list({ category, activeOnly: true });
    return products.map(toResponse);
  },
  async listAdmin() {
    const products = await productCardsRepository.list();
    return products.map(toResponse);
  },
  async get(id: number) {
    return toResponse(await productCardsRepository.findById(id));
  },
  async getBySlug(slug: string) {
    return toResponse(await productCardsRepository.findBySlug(slug));
  },
  async create(input: ProductInput) {
    return toResponse(await productCardsRepository.create(toCreateData(input)));
  },
  async update(id: number, input: Partial<ProductInput>) {
    return toResponse(await productCardsRepository.update(id, toUpdateData(input)));
  },
  async deactivate(id: number) {
    return toResponse(await productCardsRepository.deactivate(id));
  },
};
