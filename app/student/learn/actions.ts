"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export async function markContentComplete(contentId: string) {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  await prisma.moduleProgress.upsert({
    where: { studentUserId_moduleContentId: { studentUserId: user.id, moduleContentId: contentId } },
    create: { studentUserId: user.id, moduleContentId: contentId },
    update: { completedAt: new Date() },
  });

  revalidatePath("/student/learn");
}
