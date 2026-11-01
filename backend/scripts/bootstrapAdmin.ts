import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const name = process.env.ADMIN_NAME?.trim() || "Admin";
const username = process.env.ADMIN_USERNAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@yourchoice.local";
const password = process.env.ADMIN_PASSWORD;

if (!username) {
  throw new Error("ADMIN_USERNAME must be set before bootstrapping the admin account");
}
if (!password) {
  throw new Error("ADMIN_PASSWORD must be set before bootstrapping the admin account");
}

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });