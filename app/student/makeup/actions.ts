"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export async function requestMakeup(
  _prev: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") return { error: "Forbidden" };

  const originalSessionId = formData.get("originalSessionId") as string;
  const reason = (formData.get("reason") as string | null)?.trim() || null;

  if (!originalSessionId) return { error: "Session ID is required." };

  // Verify the student was actually absent from this session
  const attendance = await prisma.attendance.findUnique({
    where: { classSessionId_studentUserId: { classSessionId: originalSessionId, studentUserId: user.id } },
    select: { status: true },
  });
  if (!attendance || attendance.status !== "ABSENT") {
    return { error: "You can only request a makeup for a session you were absent from." };
  }

  // Check for existing request
  const existing = await prisma.makeupRequest.findUnique({
    where: { studentUserId_originalSessionId: { studentUserId: user.id, originalSessionId } },
  });
  if (existing) return { error: "You have already submitted a makeup request for this session." };

  await prisma.makeupRequest.create({
    data: { studentUserId: user.id, originalSessionId, reason },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "MESSAGE",
      message: "Your makeup class request has been submitted and is pending review.",
    },
  });

  revalidatePath("/student/makeup");
  return { success: "Makeup request submitted successfully." };
}
