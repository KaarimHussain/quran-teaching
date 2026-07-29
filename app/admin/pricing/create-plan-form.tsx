"use client";

import { useActionState } from "react";
import { PoundSterling } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createPricingPlan } from "./actions";

export function CreatePlanForm() {
  const [state, formAction, pending] = useActionState(createPricingPlan, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Plan Name</Label>
          <Input name="name" placeholder="e.g. Monthly Standard" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Price (£)</Label>
          <Input name="priceGbp" type="number" min="0" step="0.01" placeholder="29.99" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Billing Interval</Label>
          <select
            name="interval"
            defaultValue="MONTHLY"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly (3 months)</option>
            <option value="ANNUAL">Annual</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Max Students (family/group, optional)</Label>
          <Input name="maxStudents" type="number" min="1" placeholder="e.g. 3" />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Description (optional)</Label>
          <Textarea name="description" placeholder="What's included in this plan?" className="min-h-16" />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox name="isSiblingDiscount" id="sibling" />
          <Label htmlFor="sibling" className="font-normal">Sibling discount plan</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox name="isFamilyPackage" id="family" />
          <Label htmlFor="family" className="font-normal">Family package plan</Label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <PoundSterling className="size-4" />
          {pending ? "Creating…" : "Create Plan"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
