import "dotenv/config";
import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const configuredDatabaseUrl = process.env.DATABASE_URL;
// Do not crash the whole function during module initialization when an
// environment variable was missed in Vercel. Requests that need the database
// will return the existing sanitized 503 response, while /healthz stays useful.
const databaseUrl = configuredDatabaseUrl || "postgresql://unconfigured:unconfigured@127.0.0.1:1/unconfigured";

export const isDatabaseConfigured = Boolean(configuredDatabaseUrl);

const configuredPoolMax = Number.parseInt(process.env.DATABASE_POOL_MAX ?? "10", 10);
const poolMax = Number.isInteger(configuredPoolMax) && configuredPoolMax > 0
  ? Math.min(configuredPoolMax, 50)
  : 10;

const adapter = new PrismaPg({
  connectionString: databaseUrl,
  max: poolMax,
  connectionTimeoutMillis: 5_000,
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
globalForPrisma.prisma = prisma;

export { prisma, Prisma };
