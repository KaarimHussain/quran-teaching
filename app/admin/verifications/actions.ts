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

export async function approveTeacher(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string") return;

  await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: "VERIFIED" },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/verifications");
}

export async function rejectTeacher(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string") return;

  await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: "REJECTED" },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/verifications");
}
