"use client";

import { useActionState } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDiscountCode } from "./actions";

export function CreateDiscountForm() {
  const [state, formAction, pending] = useActionState(createDiscountCode, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Discount Code</Label>
          <Input name="code" placeholder="SIBLING20" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Type</Label>
          <select
            name="discountType"
            defaultValue="PERCENTAGE"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_GBP">Fixed amount (£)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Value (% or £p)</Label>
          <Input name="value" type="number" min="1" placeholder="20" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Max Uses (optional)</Label>
          <Input name="maxUses" type="number" min="1" placeholder="Unlimited" />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Expires At (optional)</Label>
          <Input name="expiresAt" type="date" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Tag className="size-4" />
          {pending ? "Creating…" : "Create Code"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
