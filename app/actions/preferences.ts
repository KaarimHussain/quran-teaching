"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export async function setLanguage(formData: FormData) {
  const lang = formData.get("language");
  if (lang !== "EN" && lang !== "UR" && lang !== "AR") return;

  const user = await requireCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data: { preferredLanguage: lang },
  });

  const cookieStore = await cookies();
  cookieStore.set("locale", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
