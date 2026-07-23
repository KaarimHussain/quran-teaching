"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { linkParentToStudent } from "./link-parent-actions";

type User = { id: string; name: string; email: string };

type Props = {
  parents: User[];
  students: User[];
};

export function LinkParentForm({ parents, students }: Props) {
  const [state, formAction, pending] = useActionState(linkParentToStudent, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="parentId">Parent Account</Label>
          <Select name="parentId" required>
            <SelectTrigger id="parentId">
              <SelectValue placeholder="Select parent…" />
            </SelectTrigger>
            <SelectContent>
              {parents.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} <span className="text-muted-foreground">({p.email})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="studentId">Student Account</Label>
          <Select name="studentId" required>
            <SelectTrigger id="studentId">
              <SelectValue placeholder="Select student…" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} <span className="text-muted-foreground">({s.email})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
