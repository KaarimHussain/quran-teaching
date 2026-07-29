"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { createPublicEvent } from "./actions";

export function CreateEventForm() {
  const [state, formAction, pending] = useActionState(createPublicEvent, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="event-title">Event Title</Label>
          <Input id="event-title" name="title" placeholder="e.g. Tajweed Webinar for Beginners" required />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="event-description">Description (optional)</Label>
          <Textarea id="event-description" name="description" placeholder="What will this event cover?" />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Date & Time</Label>
          <DateTimePicker name="scheduledAt" placeholder="Pick event date & time" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="event-join">Join URL (optional)</Label>
          <Input id="event-join" name="joinUrl" type="url" placeholder="https://meet.jit.si/your-room" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="event-language">Language</Label>
          <select
            id="event-language"
            name="language"
            defaultValue="EN"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="EN">English</option>
            <option value="UR">Urdu</option>
            <option value="AR">Arabic</option>
          </select>
        </div>

        <div className="flex items-end gap-3 pb-0.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="event-publish"
              name="publish"
              value="true"
              className="size-4 accent-primary"
            />
            <label htmlFor="event-publish" className="cursor-pointer text-sm font-medium">
              Publish immediately
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Plus className="size-4" /> {pending ? "Creating…" : "Create Event"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
