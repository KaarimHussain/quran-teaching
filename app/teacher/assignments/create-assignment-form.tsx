"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { createAssignment } from "./actions";

type Option = { id: string; name: string };

export function CreateAssignmentForm({
  courses,
  students,
}: {
  courses: Option[];
  students: Option[];
}) {
  const [isWorksheet, setIsWorksheet] = useState(false);
  const [state, formAction, pending] = useActionState(createAssignment, undefined);

  const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="assignment-course">Course</Label>
          <select id="assignment-course" name="courseId" required className={selectCls}>
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="assignment-title">Title</Label>
          <Input id="assignment-title" name="title" placeholder="e.g. Memorize Surah Al-Ikhlas" required />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="assignment-description">Description (optional)</Label>
          <Textarea id="assignment-description" name="description" placeholder="Instructions for students..." />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Due Date</Label>
          <DateTimePicker name="dueDate" placeholder="Pick a due date & time" />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        <input
          type="checkbox"
          id="worksheet-toggle"
          name="isWorksheet"
          value="true"
          checked={isWorksheet}
          onChange={(e) => setIsWorksheet(e.target.checked)}
          className="size-4 accent-primary"
        />
        <label htmlFor="worksheet-toggle" className="cursor-pointer text-sm font-medium">
          Custom worksheet — target a specific student
        </label>
      </div>

      {isWorksheet && students.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="target-student">Target Student</Label>
          <select id="target-student" name="targetStudentUserId" required={isWorksheet} className={selectCls}>
            <option value="">Select a student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Plus className="size-4" /> {pending ? "Creating…" : isWorksheet ? "Create Worksheet" : "Create Assignment"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
