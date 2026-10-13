"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { parseLines } from "@/lib/curriculum/lines";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

export type CurriculumFormState = { error?: string; saved?: boolean } | undefined;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateModuleCurriculum(
  _prev: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  if (!moduleId) return { error: "Missing module." };

  const updated = await prisma.courseModule.updateMany({
    where: { id: moduleId },
    data: {
      subjects: parseLines(text(formData, "subjects")),
      mandatoryLearning: parseLines(text(formData, "mandatoryLearning")),
      practice: parseLines(text(formData, "practice")),
      assessment: parseLines(text(formData, "assessment")),
      isGated: formData.get("isGated") === "on",
    },
  });
  if (updated.count === 0) return { error: "Module not found." };

  revalidatePath("/admin/curriculum");
  revalidatePath("/student/learn");
  return { saved: true };
}

export async function updateLevelNotes(
  _prev: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  await requireAdmin();

  const levelId = text(formData, "levelId");
  if (!levelId) return { error: "Missing level." };

  const purpose = text(formData, "purpose").trim();
  const methodologyNote = text(formData, "methodologyNote").trim();

  const updated = await prisma.curriculumLevel.updateMany({
    where: { id: levelId },
    data: { purpose: purpose || null, methodologyNote: methodologyNote || null },
  });
  if (updated.count === 0) return { error: "Level not found." };

  revalidatePath("/admin/curriculum");
  revalidatePath("/student/learn");
  return { saved: true };
}
