"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addLessonPlanStep } from "./actions";

export function AddStepForm({ lessonPlanId }: { lessonPlanId: string }) {
  const [state, formAction, pending] = useActionState(addLessonPlanStep, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-border pt-3">
      <input type="hidden" name="lessonPlanId" value={lessonPlanId} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label className="text-xs">Step Title</Label>
          <Input name="title" placeholder="e.g. Warm-up recitation" className="h-8 text-sm" required />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Duration (mins)</Label>
          <Input name="durationMins" type="number" min={1} defaultValue="10" className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-3">
          <Label className="text-xs">Description (optional)</Label>
          <Textarea name="description" placeholder="What happens in this step?" className="min-h-14 text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending} variant="outline" className="rounded-full">
          <Plus className="size-3" /> {pending ? "Adding…" : "Add Step"}
        </Button>
        {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
