"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { sendAnnouncementEmail } from "@/lib/mailer";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

export type AnnouncementState = { error?: string; success?: string } | undefined;

export async function sendAnnouncement(
  _prevState: AnnouncementState,
  formData: FormData
): Promise<AnnouncementState> {
  await requireAdmin();

  const message = formData.get("message");
  const targetRole = formData.get("targetRole");

  if (typeof message !== "string" || message.trim().length < 5) {
    return { error: "Message must be at least 5 characters." };
  }

  const validRoles = ["ALL", "STUDENT", "TEACHER", "PARENT", "SUPER_ADMIN"];
  if (typeof targetRole !== "string" || !validRoles.includes(targetRole)) {
    return { error: "Please select a valid audience." };
  }

  const where = targetRole === "ALL" ? {} : { role: targetRole as "STUDENT" | "TEACHER" | "PARENT" | "SUPER_ADMIN" };
  const users = await prisma.user.findMany({ where, select: { id: true, name: true, email: true } });

  if (users.length === 0) {
    return { error: "No users found for the selected audience." };
  }

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: "ANNOUNCEMENT" as const,
      message: message.trim(),
    })),
  });

  // Send email to every recipient — fire-and-forget (don't await all)
  void Promise.allSettled(
    users.map((u) => sendAnnouncementEmail(u.email, u.name, message.trim()))
  );

  revalidatePath("/admin/announcements");
  return { success: `Announcement sent to ${users.length} user${users.length === 1 ? "" : "s"}.` };
}
