"use client";

import { useState } from "react";
import { Edit3, Upload, Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateStoreModule } from "./actions";

interface EditModuleDialogProps {
  module: {
    id: string;
    title: string;
    durationMins: number | null;
    contentUrl: string | null;
  };
}

export function EditModuleDialog({ module }: EditModuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [durationMins, setDurationMins] = useState(module.durationMins?.toString() ?? "");
  const [contentUrl, setContentUrl] = useState(module.contentUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      let finalUrl = contentUrl.trim();

      // Upload file ONLY when Save Changes is clicked
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || "Failed to upload file");
        }

        const data = await res.json();
        finalUrl = data.url;
      }

      const formData = new FormData();
      formData.append("id", module.id);
      formData.append("title", title);
      formData.append("durationMins", durationMins);
      formData.append("contentUrl", finalUrl);

      await updateStoreModule(formData);
      setOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not update module.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="size-7 rounded-full p-0 text-muted-foreground hover:text-foreground">
          <Edit3 className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Edit Module</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-mod-title-${module.id}`} className="text-xs font-medium">
              Module Title
            </Label>
            <Input
              id={`edit-mod-title-${module.id}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-mod-dur-${module.id}`} className="text-xs font-medium">
              Duration (minutes)
            </Label>
            <Input
              id={`edit-mod-dur-${module.id}`}
              type="number"
              min="1"
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value)}
              className="h-9 text-xs"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium flex items-center justify-between">
              <span>Module File / Document</span>
              <span className="text-[10px] text-muted-foreground font-normal">PDF, DOCX, Video, Audio or URL</span>
            </Label>

            {selectedFile ? (
              <div className="flex h-9 items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-2.5 text-xs text-foreground">
                <span className="flex items-center gap-1.5 truncate">
                  <FileText className="size-3.5 text-primary shrink-0" />
                  <span className="truncate font-medium">{selectedFile.name}</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  className="size-5 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`edit-mod-file-${module.id}`}
                  className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs text-foreground hover:bg-accent font-medium shrink-0"
                >
                  <Upload className="size-3.5 text-primary" />
                  <span>Replace File...</span>
                </Label>
                <input
                  type="file"
                  id={`edit-mod-file-${module.id}`}
                  accept=".pdf,.doc,.docx,.mp4,.mp3,.png,.jpg,.jpeg,.zip"
                  className="hidden"
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                  }}
                />
                <Input
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="or paste URL https://..."
                  className="h-9 text-xs flex-1"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !title.trim()} className="rounded-full text-xs gap-1 font-medium">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
