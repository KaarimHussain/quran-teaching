import "dotenv/config";
import { prisma } from "@/lib/db";
import { STORE_CATALOGUE } from "@/lib/store/catalogue";

// Seeds the store with curriculum-aligned resources from lib/store/catalogue.ts.
//
//   npm run db:seed:store              add any catalogue items that are missing (by title)
//   npm run db:seed:store -- --reset   delete ALL store items first (local databases only)
//
// Items are created without cover images or download links — admins attach the
// real files from the Store admin page.
async function main() {
  const reset = process.argv.includes("--reset");
  const host = new URL(process.env.DATABASE_URL!).hostname;

  if (reset) {
    if (!["127.0.0.1", "localhost", "::1"].includes(host)) {
      console.error(`Refusing --reset against non-local database host "${host}".`);
      process.exitCode = 1;
      return;
    }
    const deleted = await prisma.storeItem.deleteMany({}); // modules cascade
    console.log(`deleted store items: ${deleted.count}`);
  }

  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN", isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) {
    console.error("No active Super Admin found — run `npm run db:seed` first.");
    process.exitCode = 1;
    return;
  }

  const existing = new Set((await prisma.storeItem.findMany({ select: { title: true } })).map((i) => i.title));
  let created = 0;
  for (const item of STORE_CATALOGUE) {
    if (existing.has(item.title)) continue;
    await prisma.storeItem.create({
      data: {
        title: item.title,
        description: item.description,
        type: item.type,
        level: item.level,
        language: item.language,
        pricePence: item.pricePence,
        durationMins: item.modules.reduce((n, m) => n + m.durationMins, 0) || item.durationMins,
        isPublished: true,
        publishedAt: new Date(),
        createdByUserId: admin.id,
        modules: {
          create: item.modules.map((m, i) => ({
            title: m.title,
            description: m.description,
            moduleOrder: i,
            durationMins: m.durationMins,
          })),
        },
      },
    });
    created++;
  }
  console.log(`store items created: ${created}, skipped (already present): ${STORE_CATALOGUE.length - created}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
