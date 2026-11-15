import { Prisma, prisma } from "../lib/prisma.js";

const include = {
  section: true,
} satisfies Prisma.ProductCardInclude;

const summarySelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  originalPrice: true,
  brand: true,
  categories: true,
  slug: true,
  stock: true,
  badge: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  section: true,
} satisfies Prisma.ProductCardSelect;

export const productCardsRepository = {
  list(filters?: { category?: string; activeOnly?: boolean }) {
    return prisma.productCard.findMany({
      where: {
        ...(filters?.category ? { categories: { has: filters.category } } : {}),
        ...(filters?.activeOnly ? { isActive: true } : {}),
      },
      orderBy: { createdAt: "desc" },
      include,
    });
  },
  listSummary() {
    return prisma.productCard.findMany({
      orderBy: { createdAt: "desc" },
      select: summarySelect,
    });
  },
  searchByName(query: string) {
    const terms = query.trim().split(/\s+/).filter(Boolean);
    return prisma.productCard.findMany({
      where: {
        isActive: true,
        AND: terms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" as const } },
            { brand: { contains: term, mode: "insensitive" as const } },
          ],
        })),
      },
      orderBy: { createdAt: "desc" },
      take: 5,
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
