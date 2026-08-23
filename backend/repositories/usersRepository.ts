import { Prisma, prisma } from "../lib/prisma.js";

export const usersRepository = {
  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByUsername(username: string) {
    return prisma.user.findFirst({ where: { username } });
  },

  findByUsernameOrEmail(username: string, email: string) {
    return prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  deleteById(id: number) {
    return prisma.user.delete({ where: { id } });
  },
};
