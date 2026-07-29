"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { getStripe } from "@/lib/stripe";

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function createCheckoutSession(planId: string, discountCode?: string) {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  const plan = await prisma.pricingPlan.findUnique({ where: { id: planId, isActive: true } });
  if (!plan || !plan.stripePriceId) {
    throw new Error("Plan not available for online payment.");
  }

  const stripe = getStripe();

  // Get or create Stripe customer
  let stripeCustomerId: string;
  const existing = await prisma.stripeCustomer.findUnique({ where: { userId: user.id } });
  if (existing) {
    stripeCustomerId = existing.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    await prisma.stripeCustomer.create({
      data: { userId: user.id, stripeCustomerId: customer.id },
    });
    stripeCustomerId = customer.id;
  }

  // Resolve discount
  let discounts: { coupon: string }[] = [];
  if (discountCode) {
    const dc = await prisma.discountCode.findUnique({
      where: { code: discountCode.toUpperCase() },
    });
    if (dc && dc.isActive && (!dc.maxUses || dc.usedCount < dc.maxUses)) {
      // Create a Stripe coupon on the fly
      const coupon = await stripe.coupons.create(
        dc.discountType === "PERCENTAGE"
          ? { percent_off: dc.value, duration: "once" }
          : { amount_off: dc.value, currency: "gbp", duration: "once" }
      );
      discounts = [{ coupon: coupon.id }];
      await prisma.discountCode.update({
        where: { id: dc.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    discounts,
    success_url: `${BASE}/student/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE}/student/subscribe`,
    metadata: { userId: user.id, planId: plan.id },
  });

  redirect(session.url!);
}
