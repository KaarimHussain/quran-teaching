"use client";

import { useActionState, useState, useRef } from "react";
import Image from "next/image";
import { Plus, AlertCircle, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createStoreItem } from "./actions";

const TYPES = [
  { value: "COURSE",           label: "Course" },
  { value: "DOCUMENT",         label: "Document" },
  { value: "VIDEO",            label: "Video" },
  { value: "AUDIO",            label: "Audio" },
  { value: "HISTORICAL_STORY", label: "Historical Story" },
];

const LEVELS = [
  { value: "ALL_LEVELS",    label: "All Levels" },
  { value: "BEGINNER",      label: "Beginner" },
  { value: "INTERMEDIATE",  label: "Intermediate" },
  { value: "ADVANCED",      label: "Advanced" },
];

const LANGUAGES = [
  { value: "EN", label: "English" },
  { value: "UR", label: "Urdu" },
  { value: "AR", label: "Arabic" },
];

const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

export function CreateItemForm() {
  const [state, formAction, pending] = useActionState(createStoreItem, undefined);
  const [type, setType]               = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [uploading, setUploading]       = useState(false);

  const formRef       = useRef<HTMLFormElement>(null);
  const fileRef       = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const uploadDone    = useRef(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
    uploadDone.current = false;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (selectedFile && !uploadDone.current) {
      e.preventDefault();
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", selectedFile);
        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url && coverInputRef.current) coverInputRef.current.value = data.url;
      } catch { /* submit without image */ } finally { setUploading(false); }
      uploadDone.current = true;
      formRef.current?.requestSubmit();
    } else {
      uploadDone.current = false;
    }
  }

  const needsDuration = ["COURSE", "VIDEO", "AUDIO"].includes(type);
  const needsContent  = ["DOCUMENT", "VIDEO", "AUDIO", "HISTORICAL_STORY"].includes(type);

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input ref={coverInputRef} type="hidden" name="coverImageUrl" />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" /> {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Type — first so other fields adapt */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="i-type">Type *</Label>
          <select
            id="i-type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={selectCls}
            required
          >
            <option value="" disabled>Select a type…</option>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {state?.fieldErrors?.type && <p className="text-xs text-destructive">{state.fieldErrors.type[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="i-title">Title *</Label>
          <Input id="i-title" name="title" placeholder="e.g. Introduction to Tajweed" required />
          {state?.fieldErrors?.title && <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="i-description">Description</Label>
          <Textarea id="i-description" name="description" placeholder="What will the learner gain from this?" className="min-h-24" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="i-level">Level</Label>
          <select id="i-level" name="level" defaultValue="ALL_LEVELS" className={selectCls}>
            {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="i-language">Language</Label>
          <select id="i-language" name="language" defaultValue="EN" className={selectCls}>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="i-price">Price (£) *</Label>
          <Input id="i-price" name="price" type="number" min="0" step="0.01" placeholder="9.99" required />
          {state?.fieldErrors?.price && <p className="text-xs text-destructive">{state.fieldErrors.price[0]}</p>}
        </div>

        {needsDuration && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="i-duration">Duration (minutes)</Label>
            <Input id="i-duration" name="durationMins" type="number" min="1" placeholder="60" />
          </div>
        )}

        {needsContent && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="i-content">
              Content URL
              <span className="ml-1 text-xs text-muted-foreground">
                ({type === "DOCUMENT" ? "PDF link" : type === "HISTORICAL_STORY" ? "article / PDF link" : "video / audio link"})
              </span>
            </Label>
            <Input id="i-content" name="contentUrl" type="url" placeholder="https://…" />
          </div>
        )}

        {type === "COURSE" && (
          <p className="sm:col-span-2 text-xs text-muted-foreground rounded-lg border border-border bg-muted/40 px-3 py-2">
            Modules are added after the course is created from the item list below.
          </p>
        )}

        {/* Cover image */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Cover Image</Label>
          {previewUrl ? (
            <div className="relative h-44 w-full overflow-hidden rounded-lg border border-border">
              <Image src={previewUrl} alt="Cover preview" fill className="object-cover" />
              <button type="button" onClick={clearImage}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/80 shadow hover:bg-background"
                title="Remove">
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
              onClick={() => fileRef.current?.click()}
            >
              <UploadCloud className="size-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Click to select a cover image (JPG, PNG, WebP)</span>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="i-publish" name="publish" value="true" className="size-4 accent-primary" />
          <label htmlFor="i-publish" className="cursor-pointer text-sm font-medium">Publish immediately</label>
        </div>
      </div>

      <div className="pt-1">
        <Button type="submit" disabled={pending || uploading} className="rounded-full">
          <Plus className="size-4" />
          {uploading ? "Uploading cover…" : pending ? "Saving…" : "Add Item"}
        </Button>
      </div>
    </form>
  );
}
