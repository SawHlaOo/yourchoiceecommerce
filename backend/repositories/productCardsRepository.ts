import { Prisma, prisma } from "../lib/prisma.js";

const include = {
  section: true,
} satisfies Prisma.ProductCardInclude;

export const productCardsRepository = {
  list(filters?: { category?: string; activeOnly?: boolean }) {
    return prisma.productCard.findMany({
      where: {
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.activeOnly ? { isActive: true } : {}),
      },
      orderBy: { createdAt: "desc" },
      include,
    });
  },
  findById(id: number) {
    return prisma.productCard.findUnique({ where: { id }, include });
  },
  findBySlug(slug: string) {
    return prisma.productCard.findUnique({ where: { slug }, include });
  },
  create(data: Prisma.ProductCardCreateInput) {
    return prisma.productCard.create({ data, include });
  },
  update(id: number, data: Prisma.ProductCardUpdateInput) {
    return prisma.productCard.update({ where: { id }, data, include });
  },
  deactivate(id: number) {
    return prisma.productCard.update({ where: { id }, data: { isActive: false }, include });
  },
  delete(id: number) {
    return prisma.productCard.delete({ where: { id }, include });
  },
};
