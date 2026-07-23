"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { sendTeacherApprovedEmail, sendTeacherRejectedEmail } from "@/lib/mailer";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function approveTeacher(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string") return;

  const teacher = await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: "VERIFIED" },
    select: { email: true, name: true },
  });

  void sendTeacherApprovedEmail(teacher.email, teacher.name);

  revalidatePath("/admin");
  revalidatePath("/admin/verifications");
}

export async function rejectTeacher(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string") return;

  const teacher = await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: "REJECTED" },
    select: { email: true, name: true },
  });

  void sendTeacherRejectedEmail(teacher.email, teacher.name);

  revalidatePath("/admin");
  revalidatePath("/admin/verifications");
}

export async function awardBadge(formData: FormData) {
  const admin = await requireAdmin();

  const teacherUserId = formData.get("teacherUserId");
  const badgeName = formData.get("badgeName");

  if (typeof teacherUserId !== "string" || typeof badgeName !== "string" || badgeName.trim().length < 2) {
    return;
  }

  const teacher = await prisma.user.findUnique({
    where: { id: teacherUserId },
    select: { role: true, verificationStatus: true },
  });

  if (!teacher || teacher.role !== "TEACHER" || teacher.verificationStatus !== "VERIFIED") {
    return;
  }

  const existing = await prisma.teacherBadge.findFirst({
    where: { teacherUserId, badgeName: badgeName.trim() },
  });

  if (!existing) {
    await prisma.teacherBadge.create({
      data: { teacherUserId, badgeName: badgeName.trim(), awardedByUserId: admin.id },
    });
  }

  revalidatePath("/admin/verifications");
}

export async function revokeBadge(formData: FormData) {
  await requireAdmin();
  const badgeId = formData.get("badgeId");
  if (typeof badgeId !== "string") return;

  await prisma.teacherBadge.delete({ where: { id: badgeId } });
  revalidatePath("/admin/verifications");
}
