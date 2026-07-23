"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export type EnrollState = { error?: string } | undefined;

export async function enrollInCourse(
  _prevState: EnrollState,
  formData: FormData
): Promise<EnrollState> {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") return { error: "Only students can enroll." };

  const courseId = formData.get("courseId");
  const pathwayLevel = formData.get("pathwayLevel");

  if (typeof courseId !== "string" || !courseId) return { error: "Invalid course." };
  if (pathwayLevel !== "BEGINNER" && pathwayLevel !== "INTERMEDIATE" && pathwayLevel !== "ADVANCED") {
    return { error: "Select a valid pathway level." };
  }

  const course = await prisma.course.findUnique({ where: { id: courseId, isActive: true } });
  if (!course) return { error: "Course not found or inactive." };

  const existing = await prisma.enrollment.findUnique({
    where: { studentUserId_courseId: { studentUserId: user.id, courseId } },
  });
  if (existing) return { error: "You are already enrolled in this course." };

  await prisma.enrollment.create({
    data: { studentUserId: user.id, courseId, pathwayLevel },
  });

  revalidatePath("/student/courses");
  revalidatePath("/student");
}
