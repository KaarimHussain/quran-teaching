import "dotenv/config";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

// LOCAL DEVELOPMENT FIXTURE — creates throwaway accounts for manually testing
// the curriculum pages. Refuses to run against anything but a local database.
//
//   Admin    test-admin@quran.test    / LocalTest-2026!
//   Teacher  test-teacher@quran.test  / LocalTest-2026!  (teaches "Quran Reading")
//   Student  test-student@quran.test  / LocalTest-2026!  (enrolled in "Quran Reading")
export const TEST_PASSWORD = "LocalTest-2026!";

async function main() {
  const host = new URL(process.env.DATABASE_URL!).hostname;
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) {
    console.error(`Refusing to seed test users into non-local database host "${host}".`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = hashPassword(TEST_PASSWORD);
  const user = (email: string, name: string, role: "SUPER_ADMIN" | "TEACHER" | "STUDENT", extra = {}) =>
    prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, role, passwordHash, ...extra },
    });

  const [, teacher, student] = await Promise.all([
    user("test-admin@quran.test", "Test Admin", "SUPER_ADMIN"),
    user("test-teacher@quran.test", "Test Teacher", "TEACHER", {
      isVolunteer: true,
      verificationStatus: "VERIFIED",
    }),
    user("test-student@quran.test", "Test Student", "STUDENT"),
  ]);

  const course = await prisma.course.findUnique({ where: { name: "Quran Reading" } });
  if (!course) {
    console.error('Course "Quran Reading" not found — run `npm run db:seed:curriculum` first.');
    process.exitCode = 1;
    return;
  }

  await prisma.enrollment.upsert({
    where: { studentUserId_courseId: { studentUserId: student.id, courseId: course.id } },
    update: { status: "ACTIVE" },
    create: { studentUserId: student.id, courseId: course.id, status: "ACTIVE" },
  });

  // A teacher "teaches" a course once they have a class session in it.
  const hasSession = await prisma.classSession.findFirst({
    where: { teacherUserId: teacher.id, courseId: course.id },
  });
  if (!hasSession) {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.classSession.create({
      data: {
        courseId: course.id,
        teacherUserId: teacher.id,
        type: "ONE_TO_ONE",
        scheduledStart: start,
        scheduledEnd: new Date(start.getTime() + 60 * 60 * 1000),
        participants: { create: { studentUserId: student.id } },
      },
    });
  }

  console.log("Test users ready: test-admin / test-teacher / test-student @quran.test");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
