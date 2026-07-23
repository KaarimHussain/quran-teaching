"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { gradeSubmission } from "./actions";

export function GradeForm({ submissionId }: { submissionId: string }) {
  const [state, formAction] = useActionState(gradeSubmission, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3 sm:flex-row sm:items-start"
    >
      <input type="hidden" name="submissionId" value={submissionId} />
      <Input
        name="grade"
        placeholder="Grade (e.g. A, Excellent)"
        className="sm:w-40"
      />
      <Textarea
        name="feedback"
        placeholder="Feedback for the student..."
        className="flex-1"
      />
      <SubmitButton
        size="sm"
        className="rounded-full sm:self-end"
        pendingLabel="Saving…"
      >
        <CheckCircle2 className="size-3.5" /> Mark Reviewed
      </SubmitButton>
      {state?.error && (
        <p className="text-xs text-destructive sm:basis-full">{state.error}</p>
      )}
    </form>
  );
}
