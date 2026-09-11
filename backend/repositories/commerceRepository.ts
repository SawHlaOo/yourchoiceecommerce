import { prisma } from "../lib/prisma.js";

export const commerceRepository = {
  findProduct(productId: number) {
    return prisma.productCard.findUnique({ where: { id: productId } });
  },
  findCartItem(userId: number, productId: number) {
    return prisma.cartItem.findUnique({ where: { userId_productId: { userId, productId } } });
  },
  listCart(userId: number) {
    return prisma.cartItem.findMany({ where: { userId }, include: { product: true }, orderBy: { createdAt: "desc" } });
  },
  async addCart(userId: number, productId: number, quantity: number) {
    return prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, quantity },
      update: { quantity: { increment: quantity } },
      include: { product: true },
    });
  },
  removeCart(userId: number, productId: number) {
    return prisma.cartItem.delete({ where: { userId_productId: { userId, productId } } });
  },
  listWishlist(userId: number) {
    return prisma.wishlistItem.findMany({ where: { userId }, include: { product: true }, orderBy: { createdAt: "desc" } });
  },
  addWishlist(userId: number, productId: number) {
    return prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
      include: { product: true },
    });
  },
  removeWishlist(userId: number, productId: number) {
    return prisma.wishlistItem.delete({ where: { userId_productId: { userId, productId } } });
  },
};
