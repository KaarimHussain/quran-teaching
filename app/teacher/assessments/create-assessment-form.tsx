"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAssessment } from "./actions";

type Option = { id: string; name: string };

export function CreateAssessmentForm({ courses }: { courses: Option[] }) {
  const [state, formAction, pending] = useActionState(createAssessment, undefined);

  const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="a-course">Course</Label>
          <select id="a-course" name="courseId" required className={selectCls}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="a-level">Pathway Level</Label>
          <select id="a-level" name="pathwayLevel" defaultValue="BEGINNER" required className={selectCls}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="a-pass">Pass Mark (%)</Label>
          <Input id="a-pass" name="passMark" type="number" min={0} max={100} defaultValue={70} />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
          <Label htmlFor="a-title">Title</Label>
          <Input id="a-title" name="title" placeholder="e.g. Beginner Tajweed Assessment" required />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
          <Label htmlFor="a-desc">Description (optional)</Label>
          <Textarea id="a-desc" name="description" placeholder="What this assessment covers…" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Plus className="size-4" /> {pending ? "Creating…" : "Create Assessment"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
