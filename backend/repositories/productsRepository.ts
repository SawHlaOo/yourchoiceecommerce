import { Prisma, prisma } from "../lib/prisma.js";

const productInclude = {
  productCards: true,
  sections: { include: { section: true } },
} satisfies Prisma.GameInclude;

export const productsRepository = {
  listGames() {
    return prisma.game.findMany({ orderBy: { createdAt: "desc" }, include: productInclude });
  },

  findGameById(id: number) {
    return prisma.game.findUnique({ where: { id }, include: productInclude });
  },

  createGame(data: Prisma.GameCreateInput) {
    return prisma.game.create({ data });
  },

  updateGame(id: number, data: Prisma.GameUpdateInput) {
    return prisma.game.update({ where: { id }, data });
  },

  deleteGame(id: number) {
    return prisma.game.delete({ where: { id } });
  },

  listApps() {
    return prisma.app.findMany({ orderBy: { createdAt: "desc" }, include: productInclude });
  },

  findAppById(id: number) {
    return prisma.app.findUnique({ where: { id }, include: productInclude });
  },

  createApp(data: Prisma.AppCreateInput) {
    return prisma.app.create({ data });
  },

  updateApp(id: number, data: Prisma.AppUpdateInput) {
    return prisma.app.update({ where: { id }, data });
  },

  deleteApp(id: number) {
    return prisma.app.delete({ where: { id } });
  },

  listPowerPoints() {
    return prisma.powerpoint.findMany({ orderBy: { createdAt: "desc" }, include: productInclude });
  },

  findPowerPointById(id: number) {
    return prisma.powerpoint.findUnique({ where: { id }, include: productInclude });
  },

  createPowerPoint(data: Prisma.PowerpointCreateInput) {
    return prisma.powerpoint.create({ data });
  },

  updatePowerPoint(id: number, data: Prisma.PowerpointUpdateInput) {
    return prisma.powerpoint.update({ where: { id }, data });
  },

  deletePowerPoint(id: number) {
    return prisma.powerpoint.delete({ where: { id } });
  },
};
