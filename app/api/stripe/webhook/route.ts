import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const stripeSubscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        if (userId && planId && stripeSubscriptionId) {
          const sub = await getStripe().subscriptions.retrieve(stripeSubscriptionId);
          const item = sub.items.data[0];
          const periodStart = item ? new Date(item.current_period_start * 1000) : new Date();
          const periodEnd = item ? new Date(item.current_period_end * 1000) : new Date();
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId },
            update: { status: "ACTIVE", currentPeriodStart: periodStart, currentPeriodEnd: periodEnd },
            create: { userId, planId, stripeSubscriptionId, status: "ACTIVE", currentPeriodStart: periodStart, currentPeriodEnd: periodEnd },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = sub.id;
        const statusMap: Record<string, "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING"> = {
          active: "ACTIVE",
          canceled: "CANCELLED",
          past_due: "PAST_DUE",
          trialing: "TRIALING",
        };
        const status = statusMap[sub.status] ?? "ACTIVE";
        const item = sub.items.data[0];
        const periodStart = item ? new Date(item.current_period_start * 1000) : new Date();
        const periodEnd = item ? new Date(item.current_period_end * 1000) : new Date();
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId },
          data: { status, currentPeriodStart: periodStart, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: sub.cancel_at_period_end },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELLED" },
        });
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const customerId = typeof pi.customer === "string" ? pi.customer : null;
        if (customerId) {
          const sc = await prisma.stripeCustomer.findUnique({
            where: { stripeCustomerId: customerId },
          });
          if (sc) {
            await prisma.paymentRecord.upsert({
              where: { stripePaymentIntentId: pi.id },
              update: { status: "SUCCEEDED" },
              create: {
                userId: sc.userId,
                stripePaymentIntentId: pi.id,
                amountGbpPence: pi.amount,
                status: "SUCCEEDED",
                description: pi.description,
              },
            });
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] Error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
