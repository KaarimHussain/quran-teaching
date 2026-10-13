"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { isModuleOpen } from "@/lib/curriculum/access";

export async function markContentComplete(contentId: string) {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  const content = await prisma.moduleContent.findUnique({
    where: { id: contentId },
    select: { module: { select: { id: true, courseId: true } } },
  });
  if (!content) throw new Error("Not found");

  // Lessons in a curriculum module stay closed until the previous module has
  // been signed off by a teacher — enforce that here, not only in the UI.
  const [courseModules, signOffs] = await Promise.all([
    prisma.courseModule.findMany({
      where: { courseId: content.module.courseId },
      select: { id: true, moduleOrder: true, isGated: true, level: { select: { number: true } } },
    }),
    prisma.moduleSignOff.findMany({
      where: { studentUserId: user.id, module: { courseId: content.module.courseId } },
      select: { moduleId: true },
    }),
  ]);
  const open = isModuleOpen(
    content.module.id,
    courseModules.map((m) => ({
      id: m.id,
      levelNumber: m.level?.number ?? null,
      moduleOrder: m.moduleOrder,
      isGated: m.isGated,
    })),
    new Set(signOffs.map((s) => s.moduleId))
  );
  if (!open) throw new Error("This module is locked until your teacher signs off the previous one.");

  await prisma.moduleProgress.upsert({
    where: { studentUserId_moduleContentId: { studentUserId: user.id, moduleContentId: contentId } },
    create: { studentUserId: user.id, moduleContentId: contentId },
    update: { completedAt: new Date() },
  });

  revalidatePath("/student/learn");
}
