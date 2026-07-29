"use client";

import { useActionState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { approveMakeupRequest, denyMakeupRequest } from "./actions";

export function ApproveMakeupForm({ requestId }: { requestId: string }) {
  const [approveState, approveAction, approvePending] = useActionState(approveMakeupRequest, undefined);
  const [denyState, denyAction, denyPending] = useActionState(denyMakeupRequest, undefined);

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-border">
      {/* Approve */}
      <form action={approveAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={requestId} />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Approve & Schedule</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Makeup Date & Time</Label>
            <Input type="datetime-local" name="proposedAt" required className="h-8 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Join URL (optional)</Label>
            <Input name="joinUrl" type="url" placeholder="https://meet.jit.si/…" className="h-8 text-sm" />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label className="text-xs">Note to student (optional)</Label>
            <Textarea name="adminNote" placeholder="Any instructions for the student…" className="min-h-14 text-sm resize-none" />
          </div>
        </div>
        {approveState?.error && <p className="text-xs text-destructive">{approveState.error}</p>}
        <Button type="submit" size="sm" disabled={approvePending} className="rounded-full w-fit">
          <CheckCircle className="size-3.5" /> {approvePending ? "Approving…" : "Approve"}
        </Button>
      </form>

      {/* Deny */}
      <form action={denyAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={requestId} />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deny Request</p>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Reason (optional — sent to student)</Label>
          <Textarea name="adminNote" placeholder="Why this request can't be approved…" className="min-h-14 text-sm resize-none" />
        </div>
        {denyState?.error && <p className="text-xs text-destructive">{denyState.error}</p>}
        <Button type="submit" size="sm" variant="destructive" disabled={denyPending} className="rounded-full w-fit">
          <XCircle className="size-3.5" /> {denyPending ? "Denying…" : "Deny"}
        </Button>
      </form>
    </div>
  );
}
