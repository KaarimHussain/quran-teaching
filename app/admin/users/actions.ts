"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export async function toggleUserActive(formData: FormData) {
  const currentUser = await requireCurrentUser();
  if (currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }

  const userId = formData.get("userId");
  if (typeof userId !== "string") return;

  if (userId === currentUser.id) {
    // Prevent admins from locking themselves out.
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
  if (!user) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin/users");
}
