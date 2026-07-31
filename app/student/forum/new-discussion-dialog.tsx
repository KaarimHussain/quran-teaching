"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus, AlertCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createForumPost } from "./actions";

type Course = { id: string; name: string };

export function NewDiscussionDialog({ courses }: { courses: Course[] }) {
  const [state, formAction, pending] = useActionState(createForumPost, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close dialog on successful submission (no error, no fieldErrors, not pending)
  useEffect(() => {
    if (!pending && state === undefined && formRef.current?.dataset.submitted === "true") {
      closeRef.current?.click();
      formRef.current.reset();
      formRef.current.dataset.submitted = "";
    }
  }, [state, pending]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="size-4" />
          New Discussion
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-primary">Start a Discussion</DialogTitle>
          <DialogDescription>
            Ask a question or share something with the community.
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          action={(fd) => {
            if (formRef.current) formRef.current.dataset.submitted = "true";
            formAction(fd);
          }}
          className="flex flex-col gap-4"
        >
          {state?.error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{state.error}</span>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              name="title"
              placeholder="What's your question or topic?"
              maxLength={200}
              required
              aria-invalid={!!state?.fieldErrors?.title}
              aria-describedby={state?.fieldErrors?.title ? "post-title-error" : undefined}
            />
            {state?.fieldErrors?.title && (
              <p id="post-title-error" className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3 shrink-0" aria-hidden />
                {state.fieldErrors.title[0]}
              </p>
            )}
          </div>

          {/* Course (optional) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-course">
              Course <span className="text-muted-foreground">(optional)</span>
            </Label>
            <select
              id="post-course"
              name="courseId"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">General discussion</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-body">Message</Label>
            <Textarea
              id="post-body"
              name="body"
              placeholder="Share your thoughts, question, or topic in detail..."
              rows={5}
              required
              aria-invalid={!!state?.fieldErrors?.body}
              aria-describedby={state?.fieldErrors?.body ? "post-body-error" : undefined}
            />
            {state?.fieldErrors?.body && (
              <p id="post-body-error" className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3 shrink-0" aria-hidden />
                {state.fieldErrors.body[0]}
              </p>
            )}
          </div>

          <DialogFooter>
            {/* Hidden close trigger so we can programmatically close on success */}
            <DialogTrigger ref={closeRef} className="hidden" aria-hidden />
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Posting…" : "Post Discussion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
