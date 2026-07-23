"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";
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
import { uploadResource } from "./actions";

type Option = { id: string; name: string };

export function UploadResourceForm({ courses }: { courses: Option[] }) {
  const [state, formAction, pending] = useActionState(uploadResource, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="resource-course">Course</Label>
          <Select name="courseId" defaultValue="none">
            <SelectTrigger id="resource-course" className="w-full">
              <SelectValue placeholder="General (no course)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">General (no course)</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="resource-type">Type</Label>
          <Select name="type" defaultValue="PDF" required>
            <SelectTrigger id="resource-type" className="w-full">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PDF">Document (PDF)</SelectItem>
              <SelectItem value="VIDEO">Video</SelectItem>
              <SelectItem value="AUDIO">Audio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="resource-title">Title</Label>
          <Input id="resource-title" name="title" placeholder="e.g. Surah Al-Fatiha Recitation Audio" required />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="resource-url">URL</Label>
          <Input id="resource-url" name="url" placeholder="https://..." required />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="resource-description">Description (optional)</Label>
          <Textarea id="resource-description" name="description" placeholder="Short description" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <UploadCloud className="size-4" /> {pending ? "Uploading…" : "Upload Resource"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
