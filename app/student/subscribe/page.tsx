import { PoundSterling, Users, Repeat } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { CheckoutButton } from "./checkout-button";

const INTERVAL_LABEL: Record<string, string> = {
  MONTHLY: "/month",
  QUARTERLY: "/quarter",
  ANNUAL: "/year",
};

function pence(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}

export default async function StudentSubscribePage() {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  const [plans, activeSubscription] = await Promise.all([
    prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: [{ isFamilyPackage: "asc" }, { isSiblingDiscount: "asc" }, { priceGbpPence: "asc" }],
    }),
    prisma.subscription.findFirst({
      where: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] } },
      include: { plan: true },
    }),
  ]);

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Plans & Pricing"
      description="Choose a subscription plan to access live classes."
    >
      <div className="flex flex-col gap-6">
        {activeSubscription && (
          <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            You are subscribed to <strong>{activeSubscription.plan.name}</strong> (
            {activeSubscription.status}). Renews{" "}
            {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString("en-GB")}.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col border-border/80">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  {plan.isSiblingDiscount && (
                    <Badge variant="secondary"><Users className="size-3 mr-1" />Sibling Discount</Badge>
                  )}
                  {plan.isFamilyPackage && (
                    <Badge variant="secondary"><Users className="size-3 mr-1" />Family Package</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.description && (
                  <CardDescription>{plan.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-3xl text-primary">
                    {pence(plan.priceGbpPence)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {INTERVAL_LABEL[plan.interval]}
                  </span>
                </div>
                {plan.maxStudents && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Up to {plan.maxStudents} students
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <CheckoutButton planId={plan.id} disabled={!!activeSubscription} />
              </CardFooter>
            </Card>
          ))}
        </div>

        {plans.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No plans available yet. Contact the admin for enrollment information.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
