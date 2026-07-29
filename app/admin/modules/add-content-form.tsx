"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createModuleContent } from "./actions";

export function AddContentForm({ moduleId }: { moduleId: string }) {
  const [state, formAction, pending] = useActionState(createModuleContent, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-border pt-3">
      <input type="hidden" name="moduleId" value={moduleId} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Content Title</Label>
          <Input name="title" placeholder="e.g. Lesson 1 Video" className="h-8 text-sm" required />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Type</Label>
          <select
            name="contentType"
            defaultValue="TEXT"
            className="h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="TEXT">Text / Article</option>
            <option value="VIDEO">Video</option>
            <option value="AUDIO">Audio</option>
            <option value="QUIZ">Quiz</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label className="text-xs">Video / Audio URL (optional)</Label>
          <Input name="videoUrl" placeholder="https://…" className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label className="text-xs">Body / Description (optional)</Label>
          <Textarea name="body" placeholder="Lesson text, quiz questions, or notes…" className="min-h-16 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Duration (mins, optional)</Label>
          <Input name="durationMins" type="number" min={1} className="h-8 text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending} variant="outline" className="rounded-full">
          <Plus className="size-3" /> {pending ? "Adding…" : "Add Content"}
        </Button>
        {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
