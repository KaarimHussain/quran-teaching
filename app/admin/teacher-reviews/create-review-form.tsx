"use client";

import { useActionState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTeacherReview } from "./actions";

type Option = { id: string; name: string };

export function CreateReviewForm({ teachers }: { teachers: Option[] }) {
  const [state, formAction, pending] = useActionState(createTeacherReview, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Teacher</Label>
          <select
            name="teacherUserId"
            required
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Score (1–10)</Label>
          <Input name="score" type="number" min={1} max={10} placeholder="e.g. 8" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Strengths (optional)</Label>
          <Textarea name="strengths" placeholder="What the teacher does well…" className="min-h-20" />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Areas to Improve (optional)</Label>
          <Textarea name="areasToImprove" placeholder="Where the teacher can grow…" className="min-h-20" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Star className="size-4" /> {pending ? "Saving…" : "Submit Review"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
