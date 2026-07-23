"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

export async function adminDeleteResource(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  const resource = await prisma.resource.findUnique({
    where: { id },
    select: { url: true },
  });

  if (!resource) return;

  await prisma.resource.delete({ where: { id } });

  // Remove from local disk if it was an uploaded file
  if (resource.url.startsWith("/uploads/")) {
    const filePath = join(process.cwd(), "public", resource.url);
    await unlink(filePath).catch(() => {});
  }

  revalidatePath("/admin/resources");
  revalidatePath("/teacher/resources");
  revalidatePath("/student/resources");
}
