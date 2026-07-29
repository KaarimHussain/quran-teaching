import { PoundSterling, Tag, Users, Repeat, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { CreatePlanForm } from "./create-plan-form";
import { CreateDiscountForm } from "./create-discount-form";
import { TogglePlanButton } from "./toggle-plan-button";

const INTERVAL_LABEL: Record<string, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUAL: "Annual",
};

function pence(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}

export default async function AdminPricingPage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const [plans, discounts] = await Promise.all([
    prisma.pricingPlan.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Pricing & Subscriptions"
      description="Manage fee plans, sibling discounts, family packages, and discount codes."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>New Pricing Plan</CardTitle>
            <CardDescription>
              Create monthly, quarterly, or annual subscription plans — including sibling and family variants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePlanForm />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PoundSterling className="size-4" /> All Plans ({plans.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {plans.length === 0 && (
              <p className="text-sm text-muted-foreground">No plans yet.</p>
            )}
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm">{plan.name}</span>
                    <Badge variant="outline">{INTERVAL_LABEL[plan.interval]}</Badge>
                    {plan.isSiblingDiscount && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="size-3 mr-1" />Sibling
                      </Badge>
                    )}
                    {plan.isFamilyPackage && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="size-3 mr-1" />Family
                      </Badge>
                    )}
                    {!plan.isActive && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  )}
                  {plan.maxStudents && (
                    <p className="text-xs text-muted-foreground">Up to {plan.maxStudents} students</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-heading text-lg text-primary">{pence(plan.priceGbpPence)}</span>
                  <TogglePlanButton planId={plan.id} isActive={plan.isActive} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>New Discount Code</CardTitle>
            <CardDescription>
              Sibling discounts, family offers, or promotional codes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateDiscountForm />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-4" /> Discount Codes ({discounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {discounts.length === 0 && (
              <p className="text-sm text-muted-foreground">No discount codes yet.</p>
            )}
            {discounts.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-sm">{d.code}</span>
                  <Badge variant="outline">
                    {d.discountType === "PERCENTAGE" ? `${d.value}%` : `£${d.value / 100}`} off
                  </Badge>
                  {!d.isActive && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{d.usedCount}{d.maxUses ? `/${d.maxUses}` : ""} used</span>
                  {d.expiresAt && (
                    <span>Expires {new Date(d.expiresAt).toLocaleDateString("en-GB")}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
