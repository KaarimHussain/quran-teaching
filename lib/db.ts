import "dotenv/config";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getPGlite } from "@/lib/pglite";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPGlite(getPGlite()) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
