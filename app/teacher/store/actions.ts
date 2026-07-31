"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export type StoreItemFormState =
  | { error?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

const VALID_TYPES  = ["COURSE", "DOCUMENT", "VIDEO", "AUDIO", "HISTORICAL_STORY"] as const;
const VALID_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"] as const;
const VALID_LANGS  = ["EN", "UR", "AR"] as const;

type ItemType  = typeof VALID_TYPES[number];
type ItemLevel = typeof VALID_LEVELS[number];
type ItemLang  = typeof VALID_LANGS[number];

export async function createTeacherStoreItem(
  _prev: StoreItemFormState,
  formData: FormData
): Promise<StoreItemFormState> {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") return { error: "Forbidden." };

  const title        = (formData.get("title")        as string | null)?.trim() ?? "";
  const description  = (formData.get("description")  as string | null)?.trim() || null;
  const type         = (formData.get("type")         as string | null) ?? "";
  const level        = (formData.get("level")        as string | null) ?? "ALL_LEVELS";
  const language     = (formData.get("language")     as string | null) ?? "EN";
  const priceRaw     = (formData.get("price")        as string | null) ?? "";
  const contentUrl   = (formData.get("contentUrl")   as string | null)?.trim() || null;
  const coverImageUrl = (formData.get("coverImageUrl") as string | null)?.trim() || null;
  const durationRaw  = (formData.get("durationMins") as string | null) ?? "";

  const fieldErrors: Record<string, string[]> = {};
  if (!title) fieldErrors.title = ["Title is required."];
  if (!VALID_TYPES.includes(type as ItemType))   fieldErrors.type  = ["Select a valid type."];
  if (!VALID_LEVELS.includes(level as ItemLevel)) fieldErrors.level = ["Select a valid level."];
  const price = parseFloat(priceRaw);
  if (!priceRaw || isNaN(price) || price < 0) fieldErrors.price = ["Enter a valid price."];
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const durationMins = durationRaw ? parseInt(durationRaw, 10) || null : null;

  try {
    await prisma.storeItem.create({
      data: {
        title,
        description,
        type:     type     as ItemType,
        level:    level    as ItemLevel,
        language: language as ItemLang,
        pricePence: Math.round(price * 100),
        contentUrl,
        coverImageUrl,
        durationMins,
        isPublished: false,
        createdByUserId: user.id,
      },
    });
  } catch {
    return { error: "Could not submit the item. Please try again." };
  }

  revalidatePath("/teacher/store");
}

export async function deleteTeacherStoreItem(formData: FormData) {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") return;

  const id = formData.get("id") as string;
  try {
    const item = await prisma.storeItem.findUnique({ where: { id } });
    if (!item || item.createdByUserId !== user.id || item.isPublished) return;
    await prisma.storeItem.delete({ where: { id } });
  } catch { return; }

  revalidatePath("/teacher/store");
}
