"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { linkParentToStudent } from "./link-parent-actions";

type User = { id: string; name: string; email: string };

type Props = {
  parents: User[];
  students: User[];
};

export function LinkParentForm({ parents, students }: Props) {
  const [state, formAction, pending] = useActionState(linkParentToStudent, undefined);

  const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="parentId">Parent Account</Label>
          <select id="parentId" name="parentId" required className={selectCls}>
            <option value="">Select parent…</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="studentId">Student Account</Label>
          <select id="studentId" name="studentId" required className={selectCls}>
            <option value="">Select student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-chart-4">{state.success}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Linking…" : "Link Parent to Student"}
      </Button>
    </form>
  );
}
