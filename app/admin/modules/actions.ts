"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

export type ModuleState = { error?: string } | undefined;

export async function createCourseModule(
  _prev: ModuleState,
  formData: FormData
): Promise<ModuleState> {
  await requireAdmin();

  const courseId = formData.get("courseId");
  const title = formData.get("title");
  const description = formData.get("description");
  const isFreeRaw = formData.get("isFree");

  if (typeof courseId !== "string" || !courseId) return { error: "Please select a course." };
  if (typeof title !== "string" || !title.trim()) return { error: "Title is required." };

  const maxOrder = await prisma.courseModule.aggregate({
    where: { courseId },
    _max: { moduleOrder: true },
  });

  await prisma.courseModule.create({
    data: {
      courseId,
      title: title.trim(),
      description:
        typeof description === "string" && description.trim() ? description.trim() : null,
      moduleOrder: (maxOrder._max.moduleOrder ?? 0) + 1,
      isFree: isFreeRaw === "on",
    },
  });

  revalidatePath("/admin/modules");
  revalidatePath("/student/learn");
}

export type ContentState = { error?: string } | undefined;

export async function createModuleContent(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  await requireAdmin();

  const moduleId = formData.get("moduleId");
  const title = formData.get("title");
  const contentType = formData.get("contentType");
  const body = formData.get("body");
  const videoUrl = formData.get("videoUrl");
  const durationRaw = formData.get("durationMins");

  if (typeof moduleId !== "string" || !moduleId) return { error: "Invalid module." };
  if (typeof title !== "string" || !title.trim()) return { error: "Content title is required." };

  const maxOrder = await prisma.moduleContent.aggregate({
    where: { moduleId },
    _max: { contentOrder: true },
  });

  const duration = parseInt(typeof durationRaw === "string" ? durationRaw : "", 10);

  await prisma.moduleContent.create({
    data: {
      moduleId,
      title: title.trim(),
      contentType: (contentType as "VIDEO" | "TEXT" | "AUDIO" | "QUIZ") ?? "TEXT",
      body: typeof body === "string" && body.trim() ? body.trim() : null,
      videoUrl: typeof videoUrl === "string" && videoUrl.trim() ? videoUrl.trim() : null,
      durationMins: Number.isNaN(duration) ? null : duration,
      contentOrder: (maxOrder._max.contentOrder ?? 0) + 1,
    },
  });

  revalidatePath("/admin/modules");
  revalidatePath("/student/learn");
}

export async function deleteCourseModule(moduleId: string) {
  await requireAdmin();
  await prisma.courseModule.delete({ where: { id: moduleId } });
  revalidatePath("/admin/modules");
  revalidatePath("/student/learn");
}

export async function deleteModuleContent(contentId: string) {
  await requireAdmin();
  await prisma.moduleContent.delete({ where: { id: contentId } });
  revalidatePath("/admin/modules");
  revalidatePath("/student/learn");
}
