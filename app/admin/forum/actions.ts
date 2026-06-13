"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function toggleForumPostLocked(formData: FormData) {
  await requireAdmin();
  const postId = formData.get("postId");
  if (typeof postId !== "string") return;

  const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { isLocked: true } });
  if (!post) return;

  await prisma.forumPost.update({ where: { id: postId }, data: { isLocked: !post.isLocked } });

  revalidatePath("/admin/forum");
  revalidatePath("/admin");
}

export async function toggleForumPostRemoved(formData: FormData) {
  await requireAdmin();
  const postId = formData.get("postId");
  if (typeof postId !== "string") return;

  const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { isRemoved: true } });
  if (!post) return;

  await prisma.forumPost.update({ where: { id: postId }, data: { isRemoved: !post.isRemoved } });

  revalidatePath("/admin/forum");
  revalidatePath("/admin");
}
