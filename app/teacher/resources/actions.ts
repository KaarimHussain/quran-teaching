"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { getTeacherCourseIds } from "@/lib/teacher";

export type UploadResourceState = { error?: string } | undefined;

const resourceTypes = ["PDF", "VIDEO", "AUDIO"];

async function requireTeacher() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function uploadResource(
  _prevState: UploadResourceState,
  formData: FormData
): Promise<UploadResourceState> {
  const user = await requireTeacher();

  const courseId = formData.get("courseId");
  const type = formData.get("type");
  const title = formData.get("title");
  const description = formData.get("description");
  const url = formData.get("url");

  if (typeof title !== "string" || title.trim().length < 3) {
    return { error: "Title must be at least 3 characters." };
  }

  if (typeof type !== "string" || !resourceTypes.includes(type)) {
    return { error: "Please choose a resource type." };
  }

  if (typeof url !== "string" || !url.trim()) {
    return { error: "Please provide a URL." };
  }

  let resolvedCourseId: string | null = null;
  if (typeof courseId === "string" && courseId && courseId !== "none") {
    const teacherCourseIds = await getTeacherCourseIds(user.id);
    if (!teacherCourseIds.includes(courseId)) {
      return { error: "You don't teach this course." };
    }
    resolvedCourseId = courseId;
  }

  await prisma.resource.create({
    data: {
      courseId: resolvedCourseId,
      type: type as "PDF" | "VIDEO" | "AUDIO",
      title: title.trim(),
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      url: url.trim(),
      uploadedByUserId: user.id,
    },
  });

  revalidatePath("/teacher/resources");
  revalidatePath("/student/resources");
}

export async function deleteResource(formData: FormData) {
  const user = await requireTeacher();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.resource.deleteMany({
    where: { id, uploadedByUserId: user.id },
  });

  revalidatePath("/teacher/resources");
  revalidatePath("/student/resources");
}
