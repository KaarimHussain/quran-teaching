"use client";

import { Button } from "@/components/ui/button";
import { togglePlanActive } from "./actions";

export function TogglePlanButton({
  planId,
  isActive,
}: {
  planId: string;
  isActive: boolean;
}) {
  return (
    <Button
      variant={isActive ? "outline" : "default"}
      size="sm"
      className="rounded-full text-xs"
      onClick={() => togglePlanActive(planId, !isActive)}
    >
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
