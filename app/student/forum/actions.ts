"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export type PostFormState =
  | { error?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

export async function createForumPost(
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const body = (formData.get("body") as string | null)?.trim() ?? "";
  const courseId = (formData.get("courseId") as string | null) || null;

  const fieldErrors: Record<string, string[]> = {};
  if (!title) fieldErrors.title = ["Title is required."];
  if (title.length > 200) fieldErrors.title = ["Title must be 200 characters or fewer."];
  if (!body) fieldErrors.body = ["Body is required."];
  if (body.length < 10) fieldErrors.body = ["Body must be at least 10 characters."];
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  try {
    const user = await requireCurrentUser();
    await prisma.forumPost.create({
      data: {
        title,
        body,
        authorUserId: user.id,
        ...(courseId ? { courseId } : {}),
      },
    });
  } catch {
    return { error: "Could not create your post. Please try again." };
  }

  revalidatePath("/student/forum");
  revalidatePath("/teacher/forum");
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
    data: { postId, authorUserId: user.id, body: body.trim() },
  });

  revalidatePath("/student/forum");
  revalidatePath(`/student/forum/${postId}`);
  revalidatePath("/teacher/forum");
  revalidatePath(`/teacher/forum/${postId}`);
}
