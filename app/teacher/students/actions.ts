"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { getTeacherCourseIds } from "@/lib/teacher";

export type AddProgressState = { error?: string } | undefined;

const subjectAreas = ["NAZRA", "HIFZ", "TAJWEED", "TAFSEER"];

async function requireTeacher() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function addProgressEntry(
  _prevState: AddProgressState,
  formData: FormData
): Promise<AddProgressState> {
  const user = await requireTeacher();

  const studentUserId = formData.get("studentUserId");
  const courseId = formData.get("courseId");
  const subjectArea = formData.get("subjectArea");
  const description = formData.get("description");
  const level = formData.get("level");
  const percentComplete = formData.get("percentComplete");

  if (
    typeof studentUserId !== "string" ||
    typeof courseId !== "string" ||
    typeof subjectArea !== "string" ||
    typeof description !== "string" ||
    !subjectAreas.includes(subjectArea) ||
    description.trim().length < 3
  ) {
    return { error: "Please fill in a subject area and a short description." };
  }

  const teacherCourseIds = await getTeacherCourseIds(user.id);
  if (!teacherCourseIds.includes(courseId)) {
    return { error: "You don't teach this course." };
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentUserId_courseId: { studentUserId, courseId } },
  });
  if (!enrollment) {
    return { error: "This student isn't enrolled in that course." };
  }

  let percent: number | null = null;
  if (typeof percentComplete === "string" && percentComplete.trim() !== "") {
    const parsed = Number(percentComplete);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      return { error: "Percent complete must be a whole number between 0 and 100." };
    }
    percent = parsed;
  }

  await prisma.progressEntry.create({
    data: {
      studentUserId,
      courseId,
      subjectArea: subjectArea as "NAZRA" | "HIFZ" | "TAJWEED" | "TAFSEER",
      description: description.trim(),
      level: typeof level === "string" && level.trim() ? level.trim() : null,
      percentComplete: percent,
      recordedByUserId: user.id,
    },
  });

  revalidatePath("/teacher/students");
  revalidatePath("/teacher");
  revalidatePath("/student/progress");
}
