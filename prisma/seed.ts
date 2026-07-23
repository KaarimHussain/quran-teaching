import "dotenv/config";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

async function main() {
  // Schema / tables are managed by Prisma migrations — run `npm run db:migrate` first.
  // This seed only ensures the Super Admin account exists so the app is usable.
  // All other data (teachers, students, courses, etc.) is created through the UI.

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exitCode = 1;
    return;
  }

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Admin",
      email,
      passwordHash: hashPassword(password),
      role: "SUPER_ADMIN",
    },
  });

  console.log(`Super Admin ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
