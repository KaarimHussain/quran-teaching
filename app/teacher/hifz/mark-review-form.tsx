"use client";

import { useActionState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { markHifzReview } from "./actions";

const qualityOptions = [
  { value: "5", label: "5 — Perfect recall" },
  { value: "4", label: "4 — Correct with slight hesitation" },
  { value: "3", label: "3 — Correct but with difficulty" },
  { value: "2", label: "2 — Incorrect but remembered on prompt" },
  { value: "1", label: "1 — Incorrect, vague memory" },
  { value: "0", label: "0 — Complete blackout" },
];

export function MarkReviewForm({ sessionId }: { sessionId: string }) {
  const [state, formAction, pending] = useActionState(markHifzReview, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <input type="hidden" name="sessionId" value={sessionId} />
      <p className="text-sm font-medium text-primary">Mark Today&apos;s Review</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Recall Quality</Label>
          <select
            name="quality"
            defaultValue="4"
            required
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {qualityOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Notes (optional)</Label>
          <Textarea name="notes" placeholder="Observations…" className="min-h-[80px]" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} size="sm" className="rounded-full">
          <CheckCircle className="size-4" /> {pending ? "Saving…" : "Mark & Schedule Next"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
