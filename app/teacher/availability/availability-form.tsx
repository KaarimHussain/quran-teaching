"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { addAvailability } from "./actions";

const days = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export function AvailabilityForm() {
  const [state, formAction, pending] = useActionState(addAvailability, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="avail-day">Day of Week</Label>
          <select
            id="avail-day"
            name="dayOfWeek"
            defaultValue="1"
            required
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {days.map((day) => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Start Time</Label>
          <TimePicker name="startTime" />
        </div>

        <div className="flex flex-col gap-2">
          <Label>End Time</Label>
          <TimePicker name="endTime" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Plus className="size-4" /> {pending ? "Adding…" : "Add Availability"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
