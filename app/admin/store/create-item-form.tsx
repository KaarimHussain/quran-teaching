"use client";

import { useActionState, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Plus, AlertCircle, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createStoreItem } from "./actions";

const selectCls =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

export function CreateItemForm() {
  const t  = useTranslations("pages.admin.store");
  const tf = useTranslations("pages.admin.store.form");

  const [state, formAction, pending] = useActionState(createStoreItem, undefined);
  const [type,     setType]     = useState("");
  const [hasPrice, setHasPrice] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl,   setPreviewUrl]   = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);

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
    if (fileRef.current)       fileRef.current.value = "";
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

  const TYPES = [
    { value: "COURSE",           label: tf("typeCourse") },
    { value: "DOCUMENT",         label: tf("typeDocument") },
    { value: "VIDEO",            label: tf("typeVideo") },
    { value: "AUDIO",            label: tf("typeAudio") },
    { value: "HISTORICAL_STORY", label: tf("typeStory") },
  ];

  const LEVELS = [
    { value: "ALL_LEVELS",   label: tf("levelAll") },
    { value: "BEGINNER",     label: tf("levelBeginner") },
    { value: "INTERMEDIATE", label: tf("levelIntermediate") },
    { value: "ADVANCED",     label: tf("levelAdvanced") },
  ];

  const LANGUAGES = [
    { value: "EN", label: tf("langEn") },
    { value: "UR", label: tf("langUr") },
    { value: "AR", label: tf("langAr") },
  ];

  const needsDuration = ["COURSE", "VIDEO", "AUDIO"].includes(type);
  const needsContent  = ["DOCUMENT", "VIDEO", "AUDIO", "HISTORICAL_STORY"].includes(type);

  function contentUrlHint() {
    if (type === "DOCUMENT")         return tf("contentUrlHint");
    if (type === "HISTORICAL_STORY") return tf("contentUrlHintArticle");
    return tf("contentUrlHintMedia");
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input ref={coverInputRef} type="hidden" name="coverImageUrl" />
      <input type="hidden" name="hasPrice" value={String(hasPrice)} />

      {/* Generic error */}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.error === "Could not save the product. Please try again."
            ? tf("errorGeneric")
            : state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Type */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="i-type">{tf("type")} *</Label>
          <select
            id="i-type" name="type" value={type} required
            onChange={(e) => setType(e.target.value)}
            className={selectCls}
          >
            <option value="" disabled>{tf("typePlaceholder")}</option>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {state?.fieldErrors?.type && (
            <p className="text-xs text-destructive">{tf("errorType")}</p>
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="i-title">{tf("itemTitle")} *</Label>
          <Input
            id="i-title" name="title" required
            placeholder={tf("itemTitlePlaceholder")}
            className={state?.fieldErrors?.title ? "border-destructive" : ""}
          />
          {state?.fieldErrors?.title && (
            <p className="text-xs text-destructive">{tf("errorTitle")}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="i-description">{tf("description")}</Label>
          <Textarea
            id="i-description" name="description"
            placeholder={tf("descPlaceholder")}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Level */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="i-level">{tf("level")}</Label>
          <select id="i-level" name="level" defaultValue="ALL_LEVELS" className={selectCls}>
            {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="i-language">{tf("language")}</Label>
          <select id="i-language" name="language" defaultValue="EN" className={selectCls}>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Price toggle */}
        <div className="flex flex-col gap-3 sm:col-span-2">
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <input
              type="checkbox" id="i-has-price" checked={hasPrice}
              onChange={(e) => setHasPrice(e.target.checked)}
              className="size-4 accent-primary cursor-pointer"
            />
            <label htmlFor="i-has-price" className="cursor-pointer text-sm font-medium">
              {tf("hasPrice")}
            </label>
          </div>

          {hasPrice && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="i-price">{tf("price")} *</Label>
              <Input
                id="i-price" name="price" type="number" min="0.01" step="0.01"
                placeholder={tf("pricePlaceholder")}
                className={state?.fieldErrors?.price ? "border-destructive" : ""}
                required
              />
              {state?.fieldErrors?.price && (
                <p className="text-xs text-destructive">{tf("errorPrice")}</p>
              )}
            </div>
          )}
        </div>

        {/* Duration — shown for COURSE, VIDEO, AUDIO */}
        {needsDuration && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>{tf("duration")}</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{tf("durationHours")}</span>
                <div className="relative">
                  <Input
                    name="durationHours" type="number" min="0" max="9999"
                    placeholder="0"
                    className="pe-12"
                  />
                  <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
                    {tf("durationHrsLabel")}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{tf("durationMinutes")}</span>
                <div className="relative">
                  <Input
                    name="durationMins" type="number" min="0" max="59"
                    placeholder="0"
                    className="pe-12"
                  />
                  <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
                    {tf("durationMinsLabel")}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{tf("durationHint")}</p>
          </div>
        )}

        {/* Content URL — shown for non-course types */}
        {needsContent && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="i-content">
              {tf("contentUrl")}
              <span className="ms-1.5 text-xs text-muted-foreground">({contentUrlHint()})</span>
            </Label>
            <Input id="i-content" name="contentUrl" type="url" placeholder="https://…" />
          </div>
        )}

        {/* Course module note */}
        {type === "COURSE" && (
          <p className="sm:col-span-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
            {tf("courseModuleNote")}
          </p>
        )}

        {/* Cover image */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>{tf("coverImage")}</Label>
          {previewUrl ? (
            <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border">
              <Image src={previewUrl} alt="Cover preview" fill className="object-cover" />
              <button
                type="button" onClick={clearImage}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/85 shadow hover:bg-background transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <UploadCloud className="size-7 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{tf("coverImageHint")}</span>
              <input
                ref={fileRef} type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        {/* Publish immediately */}
        <div className="flex items-center gap-2.5 sm:col-span-2">
          <input
            type="checkbox" id="i-publish" name="publish" value="true"
            className="size-4 accent-primary cursor-pointer"
          />
          <label htmlFor="i-publish" className="cursor-pointer text-sm font-medium">
            {tf("publishNow")}
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button type="submit" disabled={pending || uploading} className="rounded-full gap-1.5">
          <Plus className="size-4" />
          {uploading ? tf("uploading") : pending ? tf("submitting") : tf("submit")}
        </Button>
        <Button asChild type="button" variant="ghost" className="rounded-full gap-1.5">
          <Link href="/admin/store">
            <ArrowLeft className="size-4" />
            {tf("backToList")}
          </Link>
        </Button>
      </div>
    </form>
  );
}
