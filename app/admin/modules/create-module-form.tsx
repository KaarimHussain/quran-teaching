"use client";

import { useActionState } from "react";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createCourseModule } from "./actions";

type Course = { id: string; name: string };

export function CreateModuleForm({ courses }: { courses: Course[] }) {
  const [state, formAction, pending] = useActionState(createCourseModule, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Course</Label>
          <select
            name="courseId"
            required
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Module Title</Label>
          <Input name="title" placeholder="e.g. Module 1: Foundations of Arabic" required />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Description (optional)</Label>
          <Textarea name="description" placeholder="Brief overview of this module…" className="min-h-16" />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox name="isFree" id="isFree" defaultChecked />
          <Label htmlFor="isFree" className="font-normal">Free access (no enrollment required)</Label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Layers className="size-4" />
          {pending ? "Creating…" : "Create Module"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
