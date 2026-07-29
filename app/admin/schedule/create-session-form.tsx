"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { createClassSession } from "./actions";

type Option = { id: string; name: string };

export function CreateSessionForm({
  courses,
  teachers,
}: {
  courses: Option[];
  teachers: Option[];
}) {
  const [state, formAction, pending] = useActionState(createClassSession, undefined);

  const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="session-course">Course</Label>
          <select id="session-course" name="courseId" required className={selectCls}>
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="session-teacher">Teacher</Label>
          <select id="session-teacher" name="teacherUserId" required className={selectCls}>
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="session-type">Type</Label>
          <select id="session-type" name="type" defaultValue="GROUP" required className={selectCls}>
            <option value="GROUP">Group</option>
            <option value="ONE_TO_ONE">One-to-One</option>
            <option value="SEMI_PRIVATE">Semi-Private (2–5 students)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="session-gender">Gender Restriction</Label>
          <select id="session-gender" name="genderRestriction" defaultValue="MIXED" className={selectCls}>
            <option value="MIXED">Mixed (All)</option>
            <option value="SISTERS_ONLY">Sisters Only</option>
            <option value="BROTHERS_ONLY">Brothers Only</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="session-max">Max Participants (optional)</Label>
          <input
            id="session-max"
            name="maxParticipants"
            type="number"
            min={2}
            max={100}
            placeholder="e.g. 5"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Start</Label>
          <DateTimePicker name="scheduledStart" placeholder="Pick start date & time" />
        </div>

        <div className="flex flex-col gap-2">
          <Label>End</Label>
          <DateTimePicker name="scheduledEnd" placeholder="Pick end date & time" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Plus className="size-4" /> {pending ? "Scheduling…" : "Schedule Class"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
