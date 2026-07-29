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
  const isTrialRaw = formData.get("isTrial");
  const preferredTeacherId = formData.get("preferredTeacherId");

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

  const isTrial = isTrialRaw === "true";
  const trialEndsAt = isTrial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

  const resolvedPreferredTeacherId =
    typeof preferredTeacherId === "string" && preferredTeacherId.trim()
      ? preferredTeacherId.trim()
      : null;

  if (resolvedPreferredTeacherId) {
    const teacher = await prisma.user.findUnique({
      where: { id: resolvedPreferredTeacherId, role: "TEACHER", verificationStatus: "VERIFIED" },
      select: { id: true },
    });
    if (!teacher) return { error: "Selected teacher is not available." };
  }

  await prisma.enrollment.create({
    data: {
      studentUserId: user.id,
      courseId,
      pathwayLevel,
      isTrial,
      trialEndsAt,
      preferredTeacherId: resolvedPreferredTeacherId,
    },
  });

  revalidatePath("/student/courses");
  revalidatePath("/student");
}
