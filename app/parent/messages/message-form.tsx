"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendMessage } from "./actions";

type Course = { id: string; name: string };

export function MessageForm({ courses }: { courses: Course[] }) {
  const [state, formAction, pending] = useActionState(sendMessage, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="msg-title">Subject</Label>
        <Input
          id="msg-title"
          name="title"
          placeholder="e.g. Question about today's Tajweed lesson"
          required
          minLength={3}
        />
      </div>

      {courses.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="msg-course">Related Course (optional)</Label>
          <Select name="courseId">
            <SelectTrigger id="msg-course">
              <SelectValue placeholder="Select a course (optional)" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="msg-body">Message</Label>
        <Textarea
          id="msg-body"
          name="body"
          placeholder="Write your message here…"
          rows={4}
          required
          minLength={5}
          className="resize-none"
        />
      </div>

      <div>
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {pending ? "Sending…" : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
