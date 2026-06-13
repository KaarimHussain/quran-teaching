import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite/Prisma must be excluded from Server Components bundling.
  serverExternalPackages: ["@electric-sql/pglite", "pglite-prisma-adapter"],
};

export default nextConfig;
