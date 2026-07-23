"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="session-course">Course</Label>
          <Select name="courseId" required>
            <SelectTrigger id="session-course" className="w-full">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="session-teacher">Teacher</Label>
          <Select name="teacherUserId" required>
            <SelectTrigger id="session-teacher" className="w-full">
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="session-type">Type</Label>
          <Select name="type" defaultValue="GROUP" required>
            <SelectTrigger id="session-type" className="w-full">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GROUP">Group</SelectItem>
              <SelectItem value="ONE_TO_ONE">One-to-One</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div />

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
