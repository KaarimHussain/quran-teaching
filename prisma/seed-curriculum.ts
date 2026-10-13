import "dotenv/config";
import { prisma } from "@/lib/db";
import { CURRICULUM, TRACK_COURSES } from "@/lib/curriculum/data";
import { planSeed } from "@/lib/curriculum/seed-plan";

// Seeds the 22-level curriculum from lib/curriculum/data.ts. Create-only and
// idempotent: existing courses, levels and modules are never updated, so it is
// safe to re-run after admins have edited curriculum content.
async function main() {
  const courseIds = new Map<string, string>();
  for (const name of TRACK_COURSES) {
    const course = await prisma.course.upsert({ where: { name }, update: {}, create: { name } });
    courseIds.set(name, course.id);
  }

  const [existingLevels, existingModules] = await Promise.all([
    prisma.curriculumLevel.findMany({ select: { number: true } }),
    prisma.courseModule.findMany({ where: { code: { not: null } }, select: { code: true } }),
  ]);
  const plan = planSeed(
    CURRICULUM,
    new Set(existingLevels.map((l) => l.number)),
    new Set(existingModules.map((m) => m.code!))
  );

  for (const level of plan.levelsToCreate) {
    await prisma.curriculumLevel.create({
      data: {
        number: level.number,
        title: level.title,
        subtitle: level.subtitle,
        purpose: level.purpose,
        methodologyNote: level.methodologyNote,
        minAge: level.minAge,
        courseId: courseIds.get(level.courseName)!,
      },
    });
  }

  const levels = await prisma.curriculumLevel.findMany({ select: { id: true, number: true, courseId: true } });
  const levelByNumber = new Map(levels.map((l) => [l.number, l]));

  for (const { levelNumber, moduleOrder, module } of plan.modulesToCreate) {
    const level = levelByNumber.get(levelNumber)!;
    await prisma.courseModule.create({
      data: {
        courseId: level.courseId,
        levelId: level.id,
        code: module.code,
        title: module.title,
        moduleOrder,
        isFree: true,
        isGated: true,
        subjects: module.subjects,
        mandatoryLearning: module.mandatoryLearning,
        practice: module.practice,
        assessment: module.assessment,
      },
    });
  }

  console.log(
    `levels created: ${plan.levelsToCreate.length}, modules created: ${plan.modulesToCreate.length}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
