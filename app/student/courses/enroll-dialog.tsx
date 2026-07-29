"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { enrollInCourse } from "./actions";

const pathwayLevels = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

type Teacher = { id: string; name: string };

type Props = {
  courseId: string;
  courseName: string;
  teachers?: Teacher[];
};

export function EnrollDialog({ courseId, courseName, teachers = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [state, formAction, pending] = useActionState(enrollInCourse, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">Enroll Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll in {courseName}</DialogTitle>
          <DialogDescription>
            Choose your starting pathway level. You can discuss adjustments with your teacher.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="courseId" value={courseId} />

          <fieldset className="flex flex-col gap-2">
            <Label className="text-sm">Pathway Level</Label>
            <div className="flex flex-col gap-2">
              {pathwayLevels.map((level, i) => (
                <div key={level.value}>
                  <input
                    type="radio"
                    name="pathwayLevel"
                    id={`level-${level.value}`}
                    value={level.value}
                    defaultChecked={i === 0}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={`level-${level.value}`}
                    className="flex cursor-pointer items-center rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary"
                  >
                    {level.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          {teachers.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="preferred-teacher" className="text-sm">Preferred Teacher (optional)</Label>
              <select
                id="preferred-teacher"
                name="preferredTeacherId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No preference</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              id="trial-toggle"
              name="isTrial"
              value="true"
              checked={isTrial}
              onChange={(e) => setIsTrial(e.target.checked)}
              className="size-4 accent-primary"
            />
            <div className="flex flex-col gap-0.5">
              <label htmlFor="trial-toggle" className="cursor-pointer text-sm font-medium">
                Start as free trial
              </label>
              <span className="text-xs text-muted-foreground">
                7-day trial — no commitment required.
              </span>
            </div>
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enrolling…" : isTrial ? "Start Free Trial" : "Confirm Enrollment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
