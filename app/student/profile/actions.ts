"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export type ProfileState = { error?: string; success?: boolean } | undefined;

export async function updateStudentProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  const whatsappPhone = formData.get("whatsappPhone");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      whatsappPhone:
        typeof whatsappPhone === "string" && whatsappPhone.trim()
          ? whatsappPhone.trim()
          : null,
    },
  });

  revalidatePath("/student/profile");
  return { success: true };
}
