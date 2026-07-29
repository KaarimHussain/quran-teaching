"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCheckoutSession } from "./actions";

export function CheckoutButton({
  planId,
  disabled,
}: {
  planId: string;
  disabled: boolean;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await createCheckoutSession(planId, code.trim() || undefined);
    setLoading(false);
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Input
        placeholder="Discount code (optional)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={disabled || loading}
        className="h-8 text-xs"
      />
      <Button
        className="w-full rounded-full"
        disabled={disabled || loading}
        onClick={handleClick}
      >
        <CreditCard className="size-4" />
        {disabled ? "Already subscribed" : loading ? "Redirecting…" : "Subscribe"}
      </Button>
    </div>
  );
}
