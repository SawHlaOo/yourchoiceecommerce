import { prisma, Prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding users...");
  const users: Prisma.UserCreateInput[] = [
    {
      name: "Demo User",
      username: "demo",
      email: "demo@example.com",
      role: "USER",
      password: await bcrypt.hash("demo123", 10),
    }
  ];

  for (const user of users) {
    const existing = await prisma.user.findFirst({ where: { OR: [{ username: user.username }, { email: user.email }] } });
    if (!existing) {
      await prisma.user.create({ data: user });
    }
  }

  console.log("Seeding catalog...");
  const existingGame = await prisma.game.findFirst({ where: { name: "Mobile Legends Ban Ban" } });
  if (!existingGame) {
    await prisma.game.create({ data: { name: "Mobile Legends Ban Ban", description: "A fast-paced digital battle arena experience.", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80", logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80", badge: "New" } });
  }

  const existingApp = await prisma.app.findFirst({ where: { name: "Studio Planner" } });
  if (!existingApp) {
    await prisma.app.create({ data: { name: "Studio Planner", description: "Plan launches and content delivery with ease.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", logo: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", badge: "Popular" } });
  }

  const games = await prisma.game.findMany({ orderBy: { id: "asc" } });
  for (const game of games) {
    const slug = `game-${game.id}`;
    const existingCard = await prisma.productCard.findUnique({ where: { slug } });
    if (!existingCard) {
      await prisma.productCard.create({
        data: {
          name: game.name,
          description: game.description,
          thumbnail: game.image,
          price: new Prisma.Decimal("59.00"),
          originalPrice: new Prisma.Decimal("79.00"),
          brand: "ShopInMgSaw",
          category: "Games",
          slug,
          stock: 10,
          badge: game.badge,
          game: { connect: { id: game.id } },
        },
      });
    }
  }

  for (const flag of [
    { key: "promotions", enabled: true },
    { key: "new_homepage", enabled: true },
    { key: "popular", enabled: true },
    { key: "new_arrivals", enabled: true }
  ]) {
    const existingFlag = await prisma.featureFlag.findUnique({ where: { key: flag.key } });
    if (!existingFlag) {
      await prisma.featureFlag.create({ data: flag });
    }
  }
}

main()
  .then(() => {
    console.log("Seed complete.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });