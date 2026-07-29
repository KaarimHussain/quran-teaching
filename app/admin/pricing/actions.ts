"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { getStripe } from "@/lib/stripe";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

export type PlanState = { error?: string } | undefined;

export async function createPricingPlan(
  _prev: PlanState,
  formData: FormData
): Promise<PlanState> {
  await requireAdmin();

  const name = formData.get("name");
  const description = formData.get("description");
  const priceRaw = formData.get("priceGbp");
  const interval = formData.get("interval");
  const isSiblingDiscount = formData.get("isSiblingDiscount") === "on";
  const isFamilyPackage = formData.get("isFamilyPackage") === "on";
  const maxStudentsRaw = formData.get("maxStudents");

  if (typeof name !== "string" || !name.trim()) return { error: "Name is required." };

  const priceGbp = parseFloat(typeof priceRaw === "string" ? priceRaw : "0");
  if (Number.isNaN(priceGbp) || priceGbp < 0) return { error: "Invalid price." };
  const priceGbpPence = Math.round(priceGbp * 100);

  const validIntervals = ["MONTHLY", "QUARTERLY", "ANNUAL"];
  const resolvedInterval =
    typeof interval === "string" && validIntervals.includes(interval)
      ? (interval as "MONTHLY" | "QUARTERLY" | "ANNUAL")
      : "MONTHLY";

  const maxStudents =
    typeof maxStudentsRaw === "string" && maxStudentsRaw.trim()
      ? parseInt(maxStudentsRaw, 10)
      : null;

  // Create Stripe product + price if credentials are available
  let stripePriceId: string | null = null;
  try {
    const stripe = getStripe();
    const product = await stripe.products.create({ name: name.trim() });
    const intervalMap: Record<string, "month" | "year"> = {
      MONTHLY: "month",
      QUARTERLY: "month",
      ANNUAL: "year",
    };
    const intervalCount = resolvedInterval === "QUARTERLY" ? 3 : 1;
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceGbpPence,
      currency: "gbp",
      recurring: { interval: intervalMap[resolvedInterval], interval_count: intervalCount },
    });
    stripePriceId = price.id;
  } catch {
    // Stripe not configured — continue without it
  }

  await prisma.pricingPlan.create({
    data: {
      name: name.trim(),
      description:
        typeof description === "string" && description.trim() ? description.trim() : null,
      priceGbpPence,
      interval: resolvedInterval,
      stripePriceId,
      isSiblingDiscount,
      isFamilyPackage,
      maxStudents,
    },
  });

  revalidatePath("/admin/pricing");
}

export async function togglePlanActive(planId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.pricingPlan.update({ where: { id: planId }, data: { isActive } });
  revalidatePath("/admin/pricing");
}

export type DiscountState = { error?: string } | undefined;

export async function createDiscountCode(
  _prev: DiscountState,
  formData: FormData
): Promise<DiscountState> {
  await requireAdmin();

  const code = formData.get("code");
  const discountType = formData.get("discountType");
  const valueRaw = formData.get("value");
  const maxUsesRaw = formData.get("maxUses");
  const expiresAt = formData.get("expiresAt");

  if (typeof code !== "string" || !code.trim()) return { error: "Code is required." };

  const value = parseInt(typeof valueRaw === "string" ? valueRaw : "0", 10);
  if (Number.isNaN(value) || value <= 0) return { error: "Value must be positive." };

  const maxUses =
    typeof maxUsesRaw === "string" && maxUsesRaw.trim()
      ? parseInt(maxUsesRaw, 10)
      : null;

  const existing = await prisma.discountCode.findUnique({ where: { code: code.trim() } });
  if (existing) return { error: "Code already exists." };

  await prisma.discountCode.create({
    data: {
      code: code.trim().toUpperCase(),
      discountType: discountType === "FIXED_GBP" ? "FIXED_GBP" : "PERCENTAGE",
      value,
      maxUses,
      expiresAt:
        typeof expiresAt === "string" && expiresAt ? new Date(expiresAt) : null,
    },
  });

  revalidatePath("/admin/pricing");
}
