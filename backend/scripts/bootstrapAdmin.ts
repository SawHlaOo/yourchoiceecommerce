import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const isArgon2Hash = (value: string) => value.startsWith("$argon2id$");

export async function bootstrapAdmin() {
  const name = process.env.ADMIN_NAME?.trim() || "Admin";
  const username = process.env.ADMIN_USERNAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@yourchoice.local";
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!username) {
    return { bootstrapped: false, reason: "ADMIN_USERNAME is not configured" };
  }
  if (!password) {
    return { bootstrapped: false, reason: "ADMIN_PASSWORD is not configured" };
  }

  const passwordHash = isArgon2Hash(password)
    ? password
    : await bcrypt.hash(password, 10);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { name, username, email, password: passwordHash, role: "ADMIN" },
    });
  } else {
    await prisma.user.create({
      data: { name, username, email, password: passwordHash, role: "ADMIN" },
    });
  }

  await prisma.user.updateMany({
    where: { role: "ADMIN", NOT: { username } },
    data: { role: "USER" },
  });

  console.log(`Admin account ready: ${username}`);
  return { bootstrapped: true, username };
}

if (process.argv[1]?.includes("bootstrapAdmin.ts")) {
  bootstrapAdmin()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}