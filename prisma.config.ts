import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // PGlite is embedded (no network connection) so this URL is never used at
  // runtime — it only satisfies the schema engine's requirements for
  // offline commands like `prisma migrate diff` and `prisma generate`.
  datasource: {
    url: "postgresql://pglite:pglite@localhost:5432/pglite",
  },
});
