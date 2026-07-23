"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";

export async function setLanguage(formData: FormData) {
  const lang = formData.get("language");
  if (lang !== "EN" && lang !== "UR" && lang !== "AR") return;

  // Update DB preference only when logged in; cookie is always set so
  // unauthenticated pages (home, login, register) also respect the choice.
  const user = await getCurrentUser();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { preferredLanguage: lang },
    });
  }

  const cookieStore = await cookies();
  cookieStore.set("locale", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
