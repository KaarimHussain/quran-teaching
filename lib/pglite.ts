import { PGlite } from "@electric-sql/pglite";

const globalForPglite = globalThis as unknown as {
  pglite?: PGlite;
};

export function getPGlite(): PGlite {
  if (!globalForPglite.pglite) {
    const dataDir = process.env.DATABASE_DIR ?? "./prisma/pglite-data";
    globalForPglite.pglite = new PGlite(dataDir);
  }

  return globalForPglite.pglite;
}
