"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { createAssignment } from "./actions";

type Option = { id: string; name: string };

export function CreateAssignmentForm({ courses }: { courses: Option[] }) {
  const [state, formAction, pending] = useActionState(createAssignment, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="assignment-course">Course</Label>
          <Select name="courseId" required>
            <SelectTrigger id="assignment-course" className="w-full">
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

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Plus className="size-4" /> {pending ? "Creating…" : "Create Assignment"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
