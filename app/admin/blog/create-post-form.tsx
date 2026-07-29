"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBlogPost } from "./actions";

export function CreatePostForm() {
  const [state, formAction, pending] = useActionState(createBlogPost, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="post-title">Title</Label>
          <Input id="post-title" name="title" placeholder="e.g. The Importance of Tajweed" required />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="post-excerpt">Excerpt (optional)</Label>
          <Input id="post-excerpt" name="excerpt" placeholder="Short summary shown in the listing…" />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="post-body">Content</Label>
          <Textarea
            id="post-body"
            name="body"
            placeholder="Write your article here…"
            className="min-h-40"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="post-language">Language</Label>
          <select
            id="post-language"
            name="language"
            defaultValue="EN"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="EN">English</option>
            <option value="UR">Urdu</option>
            <option value="AR">Arabic</option>
          </select>
        </div>

        <div className="flex items-end gap-3 pb-0.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="post-publish"
              name="publish"
              value="true"
              className="size-4 accent-primary"
            />
            <label htmlFor="post-publish" className="cursor-pointer text-sm font-medium">
              Publish immediately
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Plus className="size-4" /> {pending ? "Saving…" : "Create Post"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
