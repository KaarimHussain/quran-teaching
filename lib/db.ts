import "dotenv/config";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrisma() {
  const adapter = new PrismaPg({
    // TLS is taken from the URL itself (e.g. `?sslmode=require` for Prisma Postgres).
    connectionString: process.env.DATABASE_URL!,
    // Fail fast when the database is unreachable so pages show the error page
    // in ~4s instead of hanging.
    connectionTimeoutMillis: 4000,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
