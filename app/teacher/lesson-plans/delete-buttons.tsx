"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteLessonPlan, deleteLessonPlanStep } from "./actions";

export function DeletePlanButton({ planId }: { planId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-destructive hover:text-destructive"
      onClick={() => {
        if (confirm("Delete this lesson plan and all its steps?")) {
          deleteLessonPlan(planId);
        }
      }}
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}

export function DeleteStepButton({ stepId }: { stepId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-6 text-destructive hover:text-destructive"
      onClick={() => deleteLessonPlanStep(stepId)}
    >
      <Trash2 className="size-3" />
    </Button>
  );
}
