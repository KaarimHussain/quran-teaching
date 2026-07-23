"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { getTeacherCourseIds } from "@/lib/teacher";

export type CreatePostState = { error?: string } | undefined;

export async function createForumPost(
  _prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const user = await requireCurrentUser();

  const title = formData.get("title");
  const body = formData.get("body");
  const courseId = formData.get("courseId");

  if (typeof title !== "string" || title.trim().length < 3) {
    return { error: "Title must be at least 3 characters." };
  }

  if (typeof body !== "string" || body.trim().length < 3) {
    return { error: "Please write a short message." };
  }

  let resolvedCourseId: string | null = null;
  if (typeof courseId === "string" && courseId && courseId !== "none") {
    const teacherCourseIds = await getTeacherCourseIds(user.id);
    if (!teacherCourseIds.includes(courseId)) {
      return { error: "You don't teach this course." };
    }
    resolvedCourseId = courseId;
  }

  await prisma.forumPost.create({
    data: {
      courseId: resolvedCourseId,
      authorUserId: user.id,
      title: title.trim(),
      body: body.trim(),
    },
  });

  revalidatePath("/teacher/forum");
  revalidatePath("/student/forum");
}

export async function createForumReply(formData: FormData) {
  const user = await requireCurrentUser();

  const postId = formData.get("postId");
  const body = formData.get("body");

  if (typeof postId !== "string" || typeof body !== "string" || !body.trim()) return;

  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { isLocked: true, isRemoved: true },
  });
  if (!post || post.isLocked || post.isRemoved) return;

  await prisma.forumReply.create({
    data: {
      postId,
      authorUserId: user.id,
      body: body.trim(),
    },
  });

  revalidatePath("/teacher/forum");
  revalidatePath("/student/forum");
}
