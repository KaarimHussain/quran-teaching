"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <Select name="targetRole" defaultValue="ALL">
            <SelectTrigger id="ann-target">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Users</SelectItem>
              <SelectItem value="STUDENT">Students only</SelectItem>
              <SelectItem value="TEACHER">Teachers only</SelectItem>
              <SelectItem value="PARENT">Parents only</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admins only</SelectItem>
            </SelectContent>
          </Select>
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
