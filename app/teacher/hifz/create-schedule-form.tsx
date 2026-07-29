"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHifzSchedule } from "./actions";

type Option = { id: string; name: string };

export function CreateHifzScheduleForm({
  courses,
  students,
}: {
  courses: Option[];
  students: Option[];
}) {
  const [state, formAction, pending] = useActionState(createHifzSchedule, undefined);

  const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <Label>Student</Label>
          <select name="studentUserId" required className={selectCls}>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Surah Name</Label>
          <Input name="surah" placeholder="e.g. Al-Baqarah" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Ayah From</Label>
          <Input name="ayahFrom" type="number" min={1} defaultValue={1} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Ayah To</Label>
          <Input name="ayahTo" type="number" min={1} defaultValue={1} required />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Plus className="size-4" /> {pending ? "Scheduling…" : "Create Schedule"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
