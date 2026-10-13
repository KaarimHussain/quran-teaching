"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { getTeacherCourseIds } from "@/lib/teacher";
import { canSignOff } from "@/lib/curriculum/signoff";

export type SignOffState = { error?: string; done?: boolean } | undefined;

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Loads everything canSignOff needs and returns the teacher, or an error message. */
async function authorize(studentUserId: string, moduleId: string) {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") throw new Error("Forbidden");
  if (!studentUserId || !moduleId) return { error: "Missing student or module." } as const;

  const [teacherCourseIds, enrollments, module] = await Promise.all([
    getTeacherCourseIds(user.id),
    prisma.enrollment.findMany({
      where: { studentUserId, status: "ACTIVE" },
      select: { courseId: true },
    }),
    prisma.courseModule.findUnique({ where: { id: moduleId }, select: { courseId: true } }),
  ]);
  if (!module) return { error: "Module not found." } as const;

  const allowed = canSignOff({
    teacherCourseIds,
    studentCourseIds: enrollments.map((e) => e.courseId),
    moduleCourseId: module.courseId,
  });
  if (!allowed) return { error: "You can only sign off modules for your own enrolled students." } as const;

  return { teacher: user } as const;
}

function revalidate() {
  revalidatePath("/teacher/curriculum");
  revalidatePath("/student/learn");
}

export async function signOffModule(_prev: SignOffState, formData: FormData): Promise<SignOffState> {
  const studentUserId = field(formData, "studentUserId");
  const moduleId = field(formData, "moduleId");
  const notes = field(formData, "notes") || null;

  const auth = await authorize(studentUserId, moduleId);
  if ("error" in auth) return { error: auth.error };

  await prisma.moduleSignOff.upsert({
    where: { studentUserId_moduleId: { studentUserId, moduleId } },
    create: { studentUserId, moduleId, notes, signedOffByUserId: auth.teacher.id },
    update: { notes, signedOffByUserId: auth.teacher.id, signedOffAt: new Date() },
  });

  revalidate();
  return { done: true };
}

export async function revokeSignOff(_prev: SignOffState, formData: FormData): Promise<SignOffState> {
  const studentUserId = field(formData, "studentUserId");
  const moduleId = field(formData, "moduleId");

  const auth = await authorize(studentUserId, moduleId);
  if ("error" in auth) return { error: auth.error };

  await prisma.moduleSignOff.deleteMany({ where: { studentUserId, moduleId } });

  revalidate();
  return { done: true };
}
