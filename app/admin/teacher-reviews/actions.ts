"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

export type ReviewState = { error?: string } | undefined;

export async function createTeacherReview(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const admin = await requireAdmin();

  const teacherUserId = formData.get("teacherUserId");
  const scoreRaw = formData.get("score");
  const strengths = formData.get("strengths");
  const areasToImprove = formData.get("areasToImprove");

  if (typeof teacherUserId !== "string" || !teacherUserId) {
    return { error: "Please select a teacher." };
  }

  const score = parseInt(typeof scoreRaw === "string" ? scoreRaw : "", 10);
  if (Number.isNaN(score) || score < 1 || score > 10) {
    return { error: "Score must be between 1 and 10." };
  }

  const teacher = await prisma.user.findUnique({
    where: { id: teacherUserId, role: "TEACHER" },
    select: { id: true },
  });
  if (!teacher) return { error: "Teacher not found." };

  await prisma.teacherPerformanceReview.create({
    data: {
      teacherUserId,
      reviewerUserId: admin.id,
      score,
      strengths: typeof strengths === "string" && strengths.trim() ? strengths.trim() : null,
      areasToImprove:
        typeof areasToImprove === "string" && areasToImprove.trim()
          ? areasToImprove.trim()
          : null,
    },
  });

  revalidatePath("/admin/teacher-reviews");
  revalidatePath("/teacher/my-reviews");
}
