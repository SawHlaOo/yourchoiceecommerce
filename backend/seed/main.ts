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
  const catalog = [
    {
      name: "Premium Wireless Headphones",
      description: "Noise-cancelling wireless headphones with all-day comfort.",
      thumbnail: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
      price: "249.00",
      originalPrice: "329.00",
      brand: "AudioMax",
      categories: ["Popular", "New arrivals"],
      slug: "premium-wireless-headphones",
      stock: 18,
      badge: "Popular",
    },
    {
      name: "Smart Fitness Watch",
      description: "Track workouts, heart rate, and sleep with a sleek daily wearable.",
      thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      price: "199.00",
      originalPrice: "259.00",
      brand: "PulseGo",
      categories: ["New arrivals"],
      slug: "smart-fitness-watch",
      stock: 12,
      badge: "New arrivals",
    },
    {
      name: "Minimal Desk Lamp",
      description: "A modern LED lamp with warm lighting and touch controls.",
      thumbnail: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      price: "79.00",
      originalPrice: "109.00",
      brand: "LumaHome",
      categories: ["Promotions", "Popular"],
      slug: "minimal-desk-lamp",
      stock: 26,
      badge: "Promotions",
    },
  ];

  for (const item of catalog) {
    const existingCard = await prisma.productCard.findUnique({ where: { slug: item.slug } });
    if (!existingCard) {
      await prisma.productCard.create({
        data: {
          name: item.name,
          description: item.description,
          thumbnail: item.thumbnail,
          price: new Prisma.Decimal(item.price),
          originalPrice: new Prisma.Decimal(item.originalPrice),
          brand: item.brand,
          categories: item.categories,
          slug: item.slug,
          stock: item.stock,
          badge: item.badge,
          isActive: true,
        },
      });
    }
  }

  for (const flag of [
    { key: "promotions", enabled: true },
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
