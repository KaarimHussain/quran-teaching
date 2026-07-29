"use client";

import { useActionState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordAssessmentResult } from "./actions";

type Student = { id: string; name: string };

export function RecordResultForm({
  assessmentId,
  students,
}: {
  assessmentId: string;
  students: Student[];
}) {
  const [state, formAction, pending] = useActionState(recordAssessmentResult, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <p className="text-sm font-medium">Record Result</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`student-${assessmentId}`}>Student</Label>
          <select
            id={`student-${assessmentId}`}
            name="studentUserId"
            required
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`score-${assessmentId}`}>Score (0–100)</Label>
          <Input
            id={`score-${assessmentId}`}
            name="score"
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 85"
            required
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-3">
          <Label htmlFor={`notes-${assessmentId}`}>Notes (optional)</Label>
          <Textarea
            id={`notes-${assessmentId}`}
            name="notes"
            placeholder="Feedback or observations…"
            className="min-h-16"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} size="sm" className="rounded-full">
          <CheckCircle className="size-4" /> {pending ? "Saving…" : "Save Result"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
