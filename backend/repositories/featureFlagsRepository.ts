import { Prisma, prisma } from "../lib/prisma.js";

export const featureFlagsRepository = {
  ensureEnabledMany(keys: string[]) {
    return prisma.featureFlag.createMany({
      data: keys.map((key) => ({ key, enabled: true })),
      skipDuplicates: true,
    });
  },

  ensureEnabled(key: string) {
    return prisma.featureFlag.upsert({
      where: { key },
      update: {},
      create: { key, enabled: true },
    });
  },

  findAll() {
    return prisma.featureFlag.findMany({ orderBy: { createdAt: "desc" } });
  },

  findByKey(key: string) {
    return prisma.featureFlag.findUnique({ where: { key } });
  },

  create(data: Prisma.FeatureFlagCreateInput) {
    return prisma.featureFlag.create({ data });
  },

  updateByKey(key: string, data: Prisma.FeatureFlagUpdateInput) {
    return prisma.featureFlag.update({ where: { key }, data });
  },

  deleteByKey(key: string) {
    return prisma.featureFlag.delete({ where: { key } });
  },
};
