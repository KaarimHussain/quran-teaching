"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { sendCertificateIssuedEmail } from "@/lib/mailer";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

export type CertificateState = { error?: string } | undefined;

export async function issueCertificate(
  _prevState: CertificateState,
  formData: FormData
): Promise<CertificateState> {
  await requireAdmin();

  const studentUserId = formData.get("studentUserId");
  const courseId = formData.get("courseId");
  const pathwayLevel = formData.get("pathwayLevel");

  if (
    typeof studentUserId !== "string" ||
    typeof courseId !== "string" ||
    (pathwayLevel !== "BEGINNER" && pathwayLevel !== "INTERMEDIATE" && pathwayLevel !== "ADVANCED")
  ) {
    return { error: "Please fill in all required fields." };
  }

  const [enrollment, existing] = await Promise.all([
    prisma.enrollment.findFirst({ where: { studentUserId, courseId } }),
    prisma.certificate.findFirst({ where: { studentUserId, courseId } }),
  ]);

  if (!enrollment) {
    return { error: "The selected student is not enrolled in this course." };
  }

  if (existing) {
    return { error: "A certificate for this student and course already exists." };
  }

  const [, student, course] = await Promise.all([
    prisma.certificate.create({ data: { studentUserId, courseId, pathwayLevel } }),
    prisma.user.findUnique({ where: { id: studentUserId }, select: { email: true, name: true } }),
    prisma.course.findUnique({ where: { id: courseId }, select: { name: true } }),
  ]);

  if (student && course) {
    const levelLabel = pathwayLevel.charAt(0) + pathwayLevel.slice(1).toLowerCase();
    void sendCertificateIssuedEmail(student.email, student.name, course.name, levelLabel);
  }

  revalidatePath("/admin/certificates");
  revalidatePath("/student/certificates");
}

export async function revokeCertificate(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.certificate.delete({ where: { id } });
  revalidatePath("/admin/certificates");
  revalidatePath("/student/certificates");
}
