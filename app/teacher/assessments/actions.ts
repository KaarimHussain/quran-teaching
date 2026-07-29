"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { getTeacherCourseIds } from "@/lib/teacher";

async function requireTeacher() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") throw new Error("Forbidden");
  return user;
}

export type AssessmentState = { error?: string } | undefined;

export async function createAssessment(
  _prev: AssessmentState,
  formData: FormData
): Promise<AssessmentState> {
  const user = await requireTeacher();

  const courseId = formData.get("courseId");
  const title = formData.get("title");
  const description = formData.get("description");
  const pathwayLevel = formData.get("pathwayLevel");
  const passMark = formData.get("passMark");

  if (typeof courseId !== "string" || typeof title !== "string" || title.trim().length < 3) {
    return { error: "Title must be at least 3 characters." };
  }

  const validLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  if (typeof pathwayLevel !== "string" || !validLevels.includes(pathwayLevel)) {
    return { error: "Select a valid pathway level." };
  }

  const courseIds = await getTeacherCourseIds(user.id);
  if (!courseIds.includes(courseId)) return { error: "You don't teach this course." };

  const pass = typeof passMark === "string" && passMark.trim() ? parseInt(passMark, 10) : 70;

  await prisma.assessment.create({
    data: {
      courseId,
      teacherUserId: user.id,
      title: title.trim(),
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      pathwayLevel: pathwayLevel as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      passMark: Number.isNaN(pass) ? 70 : Math.min(100, Math.max(0, pass)),
    },
  });

  revalidatePath("/teacher/assessments");
}

export type ResultState = { error?: string } | undefined;

export async function recordAssessmentResult(
  _prev: ResultState,
  formData: FormData
): Promise<ResultState> {
  const user = await requireTeacher();

  const assessmentId = formData.get("assessmentId");
  const studentUserId = formData.get("studentUserId");
  const scoreRaw = formData.get("score");
  const notes = formData.get("notes");

  if (typeof assessmentId !== "string" || typeof studentUserId !== "string") {
    return { error: "Invalid data." };
  }

  const score = typeof scoreRaw === "string" ? parseInt(scoreRaw, 10) : NaN;
  if (Number.isNaN(score) || score < 0 || score > 100) {
    return { error: "Score must be between 0 and 100." };
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { teacherUserId: true, passMark: true },
  });

  if (!assessment || assessment.teacherUserId !== user.id) {
    return { error: "Assessment not found or unauthorized." };
  }

  await prisma.assessmentResult.upsert({
    where: { assessmentId_studentUserId: { assessmentId, studentUserId } },
    update: {
      score,
      passed: score >= assessment.passMark,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      gradedByUserId: user.id,
      gradedAt: new Date(),
    },
    create: {
      assessmentId,
      studentUserId,
      score,
      passed: score >= assessment.passMark,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      gradedByUserId: user.id,
    },
  });

  revalidatePath("/teacher/assessments");
  revalidatePath("/student/assessments");
}
