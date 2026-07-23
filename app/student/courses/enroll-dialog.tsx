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

type Props = {
  courseId: string;
  courseName: string;
};

export function EnrollDialog({ courseId, courseName }: Props) {
  const [open, setOpen] = useState(false);
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

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enrolling…" : "Confirm Enrollment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
