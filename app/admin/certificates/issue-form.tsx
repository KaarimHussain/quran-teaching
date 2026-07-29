"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { issueCertificate } from "./actions";

type Option = { id: string; name: string };

export function IssueCertificateForm({
  students,
  courses,
}: {
  students: Option[];
  courses: Option[];
}) {
  const [state, formAction, pending] = useActionState(issueCertificate, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Student</Label>
          <select
            name="studentUserId"
            required
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
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
        <div className="flex flex-col gap-1.5">
          <Label>Pathway Level</Label>
          <select
            name="pathwayLevel"
            defaultValue="BEGINNER"
            required
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>
      <div>
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {pending ? "Issuing…" : "Issue Certificate"}
        </Button>
      </div>
    </form>
  );
}
