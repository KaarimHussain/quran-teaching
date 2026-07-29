"use client";

import { useActionState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLessonPlan } from "./actions";

type Course = { id: string; name: string };

export function CreatePlanForm({ courses }: { courses: Course[] }) {
  const [state, formAction, pending] = useActionState(createLessonPlan, undefined);

  const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Course</Label>
          <select name="courseId" required className={selectCls}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Language</Label>
          <select name="language" defaultValue="EN" className={selectCls}>
            <option value="EN">English</option>
            <option value="UR">Urdu</option>
            <option value="AR">Arabic</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Lesson Title</Label>
          <Input name="title" placeholder="e.g. Introduction to Tajweed rules" required />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Learning Objective (optional)</Label>
          <Textarea
            name="objective"
            placeholder="What will students learn by the end of this lesson?"
            className="min-h-20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Total Duration (minutes)</Label>
          <Input name="durationMins" type="number" min={5} defaultValue="60" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <BookOpen className="size-4" />
          {pending ? "Creating…" : "Create Lesson Plan"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.planId && (
          <p className="text-sm text-green-600">Plan created! Add steps below.</p>
        )}
      </div>
    </form>
  );
}
