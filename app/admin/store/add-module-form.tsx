"use client";

import { useState } from "react";
import { Plus, Upload, Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStoreModule } from "./actions";

interface AddModuleFormProps {
  storeItemId: string;
  labels: {
    moduleTitle: string;
    moduleTitlePlaceholder: string;
    moduleDuration: string;
    moduleUrl: string;
    addModule: string;
  };
}

export function AddModuleForm({ storeItemId, labels }: AddModuleFormProps) {
  const [title, setTitle] = useState("");
  const [durationMins, setDurationMins] = useState("");
  const [contentUrl, setContentUrl] = useState("");
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

      // Upload file to server ONLY when "+ Add Module" button is clicked
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

      // Add module using Server Action
      const formData = new FormData();
      formData.append("storeItemId", storeItemId);
      formData.append("title", title);
      formData.append("durationMins", durationMins);
      formData.append("contentUrl", finalUrl);

      await addStoreModule(formData);

      // Reset form
      setTitle("");
      setDurationMins("");
      setContentUrl("");
      setSelectedFile(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not add module.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2 border-t border-border pt-2">
      {errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="sm:col-span-2 flex flex-col gap-1">
          <Label htmlFor={`mod-title-${storeItemId}`} className="text-xs font-medium">
            {labels.moduleTitle}
          </Label>
          <Input
            id={`mod-title-${storeItemId}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={labels.moduleTitlePlaceholder}
            className="h-8 text-xs"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor={`mod-dur-${storeItemId}`} className="text-xs font-medium">
            {labels.moduleDuration}
          </Label>
          <Input
            id={`mod-dur-${storeItemId}`}
            type="number"
            min="1"
            value={durationMins}
            onChange={(e) => setDurationMins(e.target.value)}
            placeholder="20"
            className="h-8 text-xs"
            disabled={isSubmitting}
          />
        </div>

        {/* File Upload / Document picker */}
        <div className="sm:col-span-3 flex flex-col gap-1">
          <Label className="text-xs font-medium flex items-center justify-between">
            <span>Module Document / Resource File</span>
            <span className="text-[10px] text-muted-foreground font-normal">PDF, DOCX, Video, Audio or URL</span>
          </Label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="file"
                id={`mod-file-${storeItemId}`}
                accept=".pdf,.doc,.docx,.mp4,.mp3,.png,.jpg,.jpeg,.zip"
                className="hidden"
                disabled={isSubmitting}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSelectedFile(f);
                }}
              />

              {selectedFile ? (
                <div className="flex h-8 items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-2.5 text-xs text-foreground">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="size-3.5 text-primary shrink-0" />
                    <span className="truncate font-medium">{selectedFile.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
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
                    htmlFor={`mod-file-${storeItemId}`}
                    className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs text-foreground hover:bg-accent hover:text-accent-foreground font-medium shrink-0"
                  >
                    <Upload className="size-3.5 text-primary" />
                    <span>Upload Document File...</span>
                  </Label>

                  <Input
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    placeholder="or paste URL https://..."
                    className="h-8 text-xs flex-1"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={isSubmitting || !title.trim()}
        className="w-fit rounded-full gap-1 text-xs mt-1 font-medium"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-3 animate-spin text-primary" />
            <span>Uploading & Adding Module...</span>
          </>
        ) : (
          <>
            <Plus className="size-3" /> {labels.addModule}
          </>
        )}
      </Button>
    </form>
  );
}
