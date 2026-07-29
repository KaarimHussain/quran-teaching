"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

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
