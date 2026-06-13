"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCourse } from "./actions";

export function CreateCourseForm() {
  const [state, formAction, pending] = useActionState(createCourse, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="course-name">Course Name</Label>
        <Input id="course-name" name="name" placeholder="e.g. Tafseer" required />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="course-description">Description (optional)</Label>
        <Input id="course-description" name="description" placeholder="Short description" />
      </div>
      <Button type="submit" disabled={pending} className="rounded-full">
        <Plus className="size-4" /> {pending ? "Adding…" : "Add Course"}
      </Button>
      {state?.error && <p className="text-sm text-destructive sm:basis-full">{state.error}</p>}
    </form>
  );
}
