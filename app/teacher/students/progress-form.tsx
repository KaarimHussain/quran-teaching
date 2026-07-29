"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addProgressEntry } from "./actions";

const subjectAreaOptions = [
  { value: "NAZRA", label: "Nazra" },
  { value: "HIFZ", label: "Hifz" },
  { value: "TAJWEED", label: "Tajweed" },
  { value: "TAFSEER", label: "Tafseer" },
];

export function ProgressForm({ studentUserId, courseId }: { studentUserId: string; courseId: string }) {
  const [state, formAction, pending] = useActionState(addProgressEntry, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
      <input type="hidden" name="studentUserId" value={studentUserId} />
      <input type="hidden" name="courseId" value={courseId} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs" htmlFor={`subjectArea-${studentUserId}-${courseId}`}>Subject</Label>
          <select
            id={`subjectArea-${studentUserId}-${courseId}`}
            name="subjectArea"
            defaultValue="NAZRA"
            required
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {subjectAreaOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label className="text-xs">Note</Label>
          <Input name="description" placeholder="e.g. Memorized Surah Al-Ikhlas" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Level</Label>
          <Input name="level" placeholder="Beginner" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label className="text-xs">Percent Complete</Label>
          <Input name="percentComplete" type="number" min={0} max={100} placeholder="0-100" />
        </div>
        <Button type="submit" disabled={pending} size="sm" className="rounded-full">
          <Sparkles className="size-3.5" /> {pending ? "Saving…" : "Add Progress"}
        </Button>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
