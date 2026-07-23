"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export type LinkParentState = { error?: string; success?: string } | undefined;

export async function linkParentToStudent(
  _prevState: LinkParentState,
  formData: FormData
): Promise<LinkParentState> {
  const admin = await requireCurrentUser();
  if (admin.role !== "SUPER_ADMIN") return { error: "Forbidden." };

  const parentId = formData.get("parentId");
  const studentId = formData.get("studentId");

  if (typeof parentId !== "string" || typeof studentId !== "string") {
    return { error: "Both parent and student are required." };
  }
  if (parentId === studentId) return { error: "Parent and student must be different accounts." };

  const [parent, student] = await Promise.all([
    prisma.user.findUnique({ where: { id: parentId }, select: { role: true } }),
    prisma.user.findUnique({ where: { id: studentId }, select: { role: true } }),
  ]);

  if (!parent || parent.role !== "PARENT") return { error: "Selected account is not a parent." };
  if (!student || student.role !== "STUDENT") return { error: "Selected account is not a student." };

  try {
    await prisma.parentStudentLink.create({
      data: { parentUserId: parentId, studentUserId: studentId },
    });
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return { error: "This parent-student link already exists." };
    }
    throw err;
  }

  revalidatePath("/admin/users");
  return { success: "Parent linked to student successfully." };
}

export async function unlinkParentFromStudent(formData: FormData) {
  const admin = await requireCurrentUser();
  if (admin.role !== "SUPER_ADMIN") return;

  const parentId = formData.get("parentId");
  const studentId = formData.get("studentId");
  if (typeof parentId !== "string" || typeof studentId !== "string") return;

  await prisma.parentStudentLink.deleteMany({
    where: { parentUserId: parentId, studentUserId: studentId },
  });

  revalidatePath("/admin/users");
}
