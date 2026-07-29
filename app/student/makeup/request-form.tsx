"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestMakeup } from "./actions";

export function RequestMakeupForm({ sessionId }: { sessionId: string }) {
  const [state, formAction, pending] = useActionState(requestMakeup, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2 pt-2 border-t border-border">
      <input type="hidden" name="originalSessionId" value={sessionId} />
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Reason (optional)</Label>
        <Textarea
          name="reason"
          placeholder="Briefly explain why you missed the class…"
          className="min-h-16 text-sm resize-none"
        />
      </div>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-600">{state.success}</p>}
      <Button type="submit" disabled={pending} size="sm" className="rounded-full w-fit">
        <Send className="size-3.5" /> {pending ? "Submitting…" : "Request Makeup"}
      </Button>
    </form>
  );
}
