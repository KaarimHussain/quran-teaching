"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

async function requireParent() {
  const user = await requireCurrentUser();
  if (user.role !== "PARENT") throw new Error("Forbidden");
  return user;
}

export type MessageState = { error?: string } | undefined;

export async function sendMessage(
  _prevState: MessageState,
  formData: FormData
): Promise<MessageState> {
  const user = await requireParent();

  const title = formData.get("title");
  const body = formData.get("body");
  const courseId = formData.get("courseId");

  if (typeof title !== "string" || title.trim().length < 3) {
    return { error: "Title must be at least 3 characters." };
  }
  if (typeof body !== "string" || body.trim().length < 5) {
    return { error: "Message must be at least 5 characters." };
  }

  await prisma.forumPost.create({
    data: {
      authorUserId: user.id,
      title: title.trim(),
      body: body.trim(),
      courseId: typeof courseId === "string" && courseId !== "" ? courseId : null,
    },
  });

  revalidatePath("/parent/messages");
}

export async function markNotificationRead(formData: FormData) {
  const user = await requireParent();

  const notificationId = formData.get("notificationId");
  if (typeof notificationId !== "string") return;

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true },
  });

  revalidatePath("/parent/messages");
}

export async function markAllNotificationsRead() {
  const user = await requireParent();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/parent/messages");
}
