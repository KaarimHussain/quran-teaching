"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendAnnouncement } from "./actions";

export function AnnouncementForm() {
  const [state, formAction, pending] = useActionState(sendAnnouncement, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-chart-4/10 px-3 py-2 text-sm text-chart-4">{state.success}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ann-target">Send to</Label>
          <select
            id="ann-target"
            name="targetRole"
            defaultValue="ALL"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ALL">All Users</option>
            <option value="STUDENT">Students only</option>
            <option value="TEACHER">Teachers only</option>
            <option value="PARENT">Parents only</option>
            <option value="SUPER_ADMIN">Super Admins only</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ann-message">Message</Label>
        <Textarea
          id="ann-message"
          name="message"
          placeholder="Write your announcement here…"
          rows={4}
          required
          minLength={5}
          className="resize-none"
        />
      </div>

      <div>
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {pending ? "Sending…" : "Send Announcement"}
        </Button>
      </div>
    </form>
  );
}
