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

export type LessonPlanState = { error?: string; planId?: string } | undefined;

export async function createLessonPlan(
  _prev: LessonPlanState,
  formData: FormData
): Promise<LessonPlanState> {
  const user = await requireTeacher();

  const courseId = formData.get("courseId");
  const title = formData.get("title");
  const objective = formData.get("objective");
  const language = formData.get("language");
  const durationRaw = formData.get("durationMins");

  if (typeof courseId !== "string" || !courseId) return { error: "Please select a course." };
  if (typeof title !== "string" || !title.trim()) return { error: "Title is required." };

  const courseIds = await getTeacherCourseIds(user.id);
  if (!courseIds.includes(courseId)) return { error: "You don't teach this course." };

  const duration = parseInt(typeof durationRaw === "string" ? durationRaw : "60", 10);

  const plan = await prisma.lessonPlan.create({
    data: {
      teacherUserId: user.id,
      courseId,
      title: title.trim(),
      objective:
        typeof objective === "string" && objective.trim() ? objective.trim() : null,
      language: (language as "EN" | "UR" | "AR") ?? "EN",
      durationMins: Number.isNaN(duration) ? 60 : duration,
    },
  });

  revalidatePath("/teacher/lesson-plans");
  return { planId: plan.id };
}

export type StepState = { error?: string } | undefined;

export async function addLessonPlanStep(
  _prev: StepState,
  formData: FormData
): Promise<StepState> {
  const user = await requireTeacher();

  const lessonPlanId = formData.get("lessonPlanId");
  const title = formData.get("title");
  const description = formData.get("description");
  const durationRaw = formData.get("durationMins");

  if (typeof lessonPlanId !== "string" || !lessonPlanId)
    return { error: "Invalid lesson plan." };
  if (typeof title !== "string" || !title.trim()) return { error: "Step title is required." };

  const plan = await prisma.lessonPlan.findUnique({
    where: { id: lessonPlanId },
    select: { teacherUserId: true, steps: { select: { stepOrder: true } } },
  });
  if (!plan || plan.teacherUserId !== user.id) return { error: "Lesson plan not found." };

  const nextOrder =
    plan.steps.length > 0 ? Math.max(...plan.steps.map((s) => s.stepOrder)) + 1 : 1;

  const duration = parseInt(typeof durationRaw === "string" ? durationRaw : "10", 10);

  await prisma.lessonPlanStep.create({
    data: {
      lessonPlanId,
      stepOrder: nextOrder,
      title: title.trim(),
      description:
        typeof description === "string" && description.trim() ? description.trim() : null,
      durationMins: Number.isNaN(duration) ? 10 : duration,
    },
  });

  revalidatePath("/teacher/lesson-plans");
}

export async function deleteLessonPlan(planId: string) {
  const user = await requireTeacher();

  const plan = await prisma.lessonPlan.findUnique({
    where: { id: planId },
    select: { teacherUserId: true },
  });
  if (!plan || plan.teacherUserId !== user.id) throw new Error("Not found.");

  await prisma.lessonPlan.delete({ where: { id: planId } });
  revalidatePath("/teacher/lesson-plans");
}

export async function deleteLessonPlanStep(stepId: string) {
  const user = await requireTeacher();

  const step = await prisma.lessonPlanStep.findUnique({
    where: { id: stepId },
    include: { lessonPlan: { select: { teacherUserId: true } } },
  });
  if (!step || step.lessonPlan.teacherUserId !== user.id) throw new Error("Not found.");

  await prisma.lessonPlanStep.delete({ where: { id: stepId } });
  revalidatePath("/teacher/lesson-plans");
}
