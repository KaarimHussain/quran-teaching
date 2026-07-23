"use client";

import { useActionState, useState, useRef } from "react";
import { UploadCloud, Loader2, Link } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setUploadedUrl(data.url);
      } else {
        setUploadedUrl("");
        alert(data.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

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

        {/* File upload */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Upload File</Label>
          <div
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="size-5 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {uploading
                ? "Uploading…"
                : fileName
                ? fileName
                : "Click to select a file (PDF, MP3, MP4 — max 50 MB)"}
            </span>
            {uploadedUrl && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Link className="size-3" /> Uploaded
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.mp3,.mp4,.wav,.webm,.ogg,.m4a"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Hidden URL field populated by upload or typed manually */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="resource-url">Or paste a URL</Label>
          <Input
            id="resource-url"
            name="url"
            placeholder="https://…"
            value={uploadedUrl}
            onChange={(e) => setUploadedUrl(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="resource-description">Description (optional)</Label>
          <Textarea id="resource-description" name="description" placeholder="Short description" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || uploading} className="rounded-full">
          <UploadCloud className="size-4" /> {pending ? "Saving…" : "Upload Resource"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
