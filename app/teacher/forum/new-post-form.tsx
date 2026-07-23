"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
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
import { createForumPost } from "./actions";

type Option = { id: string; name: string };

export function NewPostForm({ courses }: { courses: Option[] }) {
  const [state, formAction, pending] = useActionState(createForumPost, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="post-title">Title</Label>
          <Input id="post-title" name="title" placeholder="What's on your mind?" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="post-course">Category</Label>
          <Select name="courseId" defaultValue="none">
            <SelectTrigger id="post-course" className="w-full">
              <SelectValue placeholder="General Discussion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">General Discussion</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-3">
          <Label htmlFor="post-body">Message</Label>
          <Textarea id="post-body" name="body" placeholder="Share something with the community..." required />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Plus className="size-4" /> {pending ? "Posting…" : "New Discussion"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
