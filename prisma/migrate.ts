import "dotenv/config";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { getPGlite } from "@/lib/pglite";

// PGlite has no TCP listener, so `prisma migrate deploy` can't target it.
// This script applies the SQL files under prisma/migrations directly,
// tracking applied migrations in `_prisma_migrations` the same way
// `prisma migrate deploy` would.
async function main() {
  const db = getPGlite();
  await db.waitReady;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY NOT NULL,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const migrationsDir = path.join(__dirname, "migrations");
  const migrationNames = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const name of migrationNames) {
    const sqlPath = path.join(migrationsDir, name, "migration.sql");
    const sql = readFileSync(sqlPath, "utf-8");
    const checksum = createHash("sha256").update(sql).digest("hex");

    const { rows } = await db.query<{ id: string; finished_at: string | null }>(
      `SELECT "id", "finished_at" FROM "_prisma_migrations" WHERE "migration_name" = $1`,
      [name],
    );

    if (rows.length > 0 && rows[0].finished_at) {
      console.log(`- Skipping ${name} (already applied)`);
      continue;
    }

    console.log(`- Applying ${name}...`);
    await db.exec(sql);
    await db.query(
      `INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "started_at", "finished_at")
       VALUES ($1, $2, $3, now(), now())`,
      [crypto.randomUUID(), checksum, name],
    );
    console.log(`  Applied ${name}`);
  }

  console.log("Database is up to date.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPGlite().close();
  });
