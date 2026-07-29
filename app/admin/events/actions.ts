"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

export type EventState = { error?: string } | undefined;

export async function createPublicEvent(
  _prevState: EventState,
  formData: FormData
): Promise<EventState> {
  const user = await requireAdmin();

  const title = formData.get("title");
  const description = formData.get("description");
  const scheduledAt = formData.get("scheduledAt");
  const joinUrl = formData.get("joinUrl");
  const language = formData.get("language");
  const publishRaw = formData.get("publish");

  if (typeof title !== "string" || title.trim().length < 3) {
    return { error: "Title must be at least 3 characters." };
  }
  if (typeof scheduledAt !== "string" || !scheduledAt) {
    return { error: "Please set a date and time." };
  }

  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return { error: "Invalid date/time." };

  const validLanguages = ["EN", "UR", "AR"];
  const resolvedLanguage =
    typeof language === "string" && validLanguages.includes(language)
      ? (language as "EN" | "UR" | "AR")
      : "EN";

  await prisma.publicEvent.create({
    data: {
      title: title.trim(),
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      scheduledAt: date,
      joinUrl: typeof joinUrl === "string" && joinUrl.trim() ? joinUrl.trim() : null,
      language: resolvedLanguage,
      isPublished: publishRaw === "true",
      hostUserId: user.id,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function toggleEventPublished(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const currentPublished = formData.get("isPublished") === "true";
  if (typeof id !== "string") return;

  await prisma.publicEvent.update({
    where: { id },
    data: { isPublished: !currentPublished },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deletePublicEvent(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.publicEvent.delete({ where: { id } });

  revalidatePath("/admin/events");
  revalidatePath("/events");
}
