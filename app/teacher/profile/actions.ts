"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export type ProfileState = { error?: string; success?: boolean } | undefined;

export async function updateTeacherProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") return { error: "Forbidden" };

  const bio = formData.get("bio");
  const teachingHoursRaw = formData.get("teachingHoursLogged");
  const specialNeedsNote = formData.get("specialNeedsNote");

  const verifiedLanguagesRaw = formData.getAll("verifiedLanguages");
  const validLanguages = ["EN", "UR", "AR"];
  const verifiedLanguages = verifiedLanguagesRaw.filter(
    (l): l is string => typeof l === "string" && validLanguages.includes(l)
  );

  const teachingHours =
    typeof teachingHoursRaw === "string" && teachingHoursRaw.trim()
      ? parseInt(teachingHoursRaw.trim(), 10)
      : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bio: typeof bio === "string" && bio.trim() ? bio.trim() : null,
      teachingHoursLogged: teachingHours && !Number.isNaN(teachingHours) ? teachingHours : null,
      verifiedLanguages: verifiedLanguages.length > 0 ? verifiedLanguages : Prisma.JsonNull,
      specialNeedsNote:
        typeof specialNeedsNote === "string" && specialNeedsNote.trim()
          ? specialNeedsNote.trim()
          : null,
    },
  });

  revalidatePath("/teacher/profile");
  return { success: true };
}
