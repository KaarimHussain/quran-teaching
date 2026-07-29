"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { sendMakeupApprovedEmail, sendMakeupDeniedEmail } from "@/lib/mailer";

export async function approveMakeupRequest(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const admin = await requireCurrentUser();
  if (admin.role !== "SUPER_ADMIN") return { error: "Forbidden" };

  const id = formData.get("id") as string;
  const proposedAtRaw = formData.get("proposedAt") as string;
  const joinUrl = (formData.get("joinUrl") as string | null)?.trim() || null;
  const adminNote = (formData.get("adminNote") as string | null)?.trim() || null;

  if (!id || !proposedAtRaw) return { error: "Request ID and proposed date are required." };

  const proposedAt = new Date(proposedAtRaw);
  if (isNaN(proposedAt.getTime())) return { error: "Invalid date/time." };

  const request = await prisma.makeupRequest.update({
    where: { id },
    data: { status: "APPROVED", proposedAt, joinUrl, adminNote },
    include: {
      student: { select: { name: true, email: true } },
      originalSession: { select: { course: { select: { name: true } } } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: request.studentUserId,
      type: "MESSAGE",
      message: `Your makeup class request for ${request.originalSession.course.name} has been approved.`,
    },
  });

  void sendMakeupApprovedEmail(
    request.student.email,
    request.student.name,
    request.originalSession.course.name,
    proposedAt,
    joinUrl
  );

  revalidatePath("/admin/makeup");
  revalidatePath("/student/makeup");
  return {};
}

export async function denyMakeupRequest(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const admin = await requireCurrentUser();
  if (admin.role !== "SUPER_ADMIN") return { error: "Forbidden" };

  const id = formData.get("id") as string;
  const adminNote = (formData.get("adminNote") as string | null)?.trim() || null;

  if (!id) return { error: "Request ID is required." };

  const request = await prisma.makeupRequest.update({
    where: { id },
    data: { status: "DENIED", adminNote },
    include: {
      student: { select: { name: true, email: true } },
      originalSession: { select: { course: { select: { name: true } } } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: request.studentUserId,
      type: "MESSAGE",
      message: `Your makeup class request for ${request.originalSession.course.name} could not be approved${adminNote ? `: ${adminNote}` : "."}`,
    },
  });

  void sendMakeupDeniedEmail(
    request.student.email,
    request.student.name,
    request.originalSession.course.name,
    adminNote
  );

  revalidatePath("/admin/makeup");
  revalidatePath("/student/makeup");
  return {};
}
