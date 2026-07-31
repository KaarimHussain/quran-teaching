"use server";

import { redirect } from "next/navigation";
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

export async function createStoreItem(
  _prev: StoreItemFormState,
  formData: FormData
): Promise<StoreItemFormState> {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") return { error: "Forbidden." };

  const title         = (formData.get("title")         as string | null)?.trim() ?? "";
  const description   = (formData.get("description")   as string | null)?.trim() || null;
  const type          = (formData.get("type")          as string | null) ?? "";
  const level         = (formData.get("level")         as string | null) ?? "ALL_LEVELS";
  const language      = (formData.get("language")      as string | null) ?? "EN";
  const hasPrice      = formData.get("hasPrice") === "true";
  const priceRaw      = (formData.get("price")         as string | null) ?? "";
  const contentUrl    = (formData.get("contentUrl")    as string | null)?.trim() || null;
  const coverImageUrl = (formData.get("coverImageUrl") as string | null)?.trim() || null;
  const durationHrsRaw  = (formData.get("durationHours") as string | null) ?? "";
  const durationMinsRaw = (formData.get("durationMins")  as string | null) ?? "";
  const publish         = formData.get("publish") === "true";

  const fieldErrors: Record<string, string[]> = {};

  if (!title) fieldErrors.title = ["Title is required."];
  if (!VALID_TYPES.includes(type as ItemType))    fieldErrors.type  = ["Select a valid type."];
  if (!VALID_LEVELS.includes(level as ItemLevel)) fieldErrors.level = ["Select a valid level."];

  let pricePence = 0;
  if (hasPrice) {
    const price = parseFloat(priceRaw);
    if (!priceRaw || isNaN(price) || price < 0) {
      fieldErrors.price = ["Enter a valid price."];
    } else {
      pricePence = Math.round(price * 100);
    }
  }

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const hrs  = durationHrsRaw  ? parseInt(durationHrsRaw,  10) || 0 : 0;
  const mins = durationMinsRaw ? parseInt(durationMinsRaw, 10) || 0 : 0;
  const durationMins = (hrs * 60 + mins) || null;

  try {
    await prisma.storeItem.create({
      data: {
        title,
        description,
        type:     type     as ItemType,
        level:    level    as ItemLevel,
        language: language as ItemLang,
        pricePence,
        contentUrl,
        coverImageUrl,
        durationMins,
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
        createdByUserId: user.id,
      },
    });
  } catch {
    return { error: "Could not save the product. Please try again." };
  }

  revalidatePath("/admin/store");
  revalidatePath("/store");
  redirect("/admin/store");
}

export async function addStoreModule(formData: FormData) {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") return;

  const storeItemId  = formData.get("storeItemId")  as string;
  const title        = (formData.get("title")        as string | null)?.trim() ?? "";
  const description  = (formData.get("description")  as string | null)?.trim() || null;
  const contentUrl   = (formData.get("contentUrl")   as string | null)?.trim() || null;
  const durationRaw  = (formData.get("durationMins") as string | null) ?? "";
  const durationMins = durationRaw ? parseInt(durationRaw, 10) || null : null;

  if (!title || !storeItemId) return;

  try {
    const count = await prisma.storeModule.count({ where: { storeItemId } });
    await prisma.storeModule.create({
      data: { storeItemId, title, description, contentUrl, durationMins, moduleOrder: count },
    });
  } catch { return; }

  revalidatePath("/admin/store");
}

export async function deleteStoreModule(formData: FormData) {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") return;

  const id = formData.get("id") as string;
  try { await prisma.storeModule.delete({ where: { id } }); } catch { return; }

  revalidatePath("/admin/store");
}

export async function toggleStoreItemPublished(formData: FormData) {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") return;

  const id          = formData.get("id")          as string;
  const isPublished = formData.get("isPublished") === "true";

  try {
    await prisma.storeItem.update({
      where: { id },
      data: { isPublished: !isPublished, publishedAt: !isPublished ? new Date() : null },
    });
  } catch { return; }

  revalidatePath("/admin/store");
  revalidatePath("/store");
}

export async function deleteStoreItem(formData: FormData) {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") return;

  const id = formData.get("id") as string;
  try { await prisma.storeItem.delete({ where: { id } }); } catch { return; }

  revalidatePath("/admin/store");
  revalidatePath("/store");
}
