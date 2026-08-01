"use client";

import { useState } from "react";
import { Edit, Upload, Loader2, FileText, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateStoreItem } from "./actions";

interface EditItemDialogProps {
  item: {
    id: string;
    title: string;
    description: string | null;
    type: "COURSE" | "DOCUMENT" | "VIDEO" | "AUDIO" | "HISTORICAL_STORY";
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
    language: "EN" | "UR" | "AR";
    pricePence: number;
    coverImageUrl: string | null;
    contentUrl: string | null;
    durationMins: number | null;
  };
}

export function EditItemDialog({ item }: EditItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [type, setType] = useState(item.type);
  const [level, setLevel] = useState(item.level);
  const [language, setLanguage] = useState(item.language);
  const [hasPrice, setHasPrice] = useState(item.pricePence > 0);
  const [price, setPrice] = useState(item.pricePence > 0 ? (item.pricePence / 100).toString() : "");
  const [coverImageUrl, setCoverImageUrl] = useState(item.coverImageUrl ?? "");
  const [contentUrl, setContentUrl] = useState(item.contentUrl ?? "");
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedContentFile, setSelectedContentFile] = useState<File | null>(null);

  const initialHrs = item.durationMins ? Math.floor(item.durationMins / 60) : 0;
  const initialMins = item.durationMins ? item.durationMins % 60 : 0;
  const [durationHours, setDurationHours] = useState(initialHrs > 0 ? initialHrs.toString() : "");
  const [durationMins, setDurationMins] = useState(initialMins > 0 ? initialMins.toString() : "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      let finalCoverUrl = coverImageUrl.trim();
      let finalContentUrl = contentUrl.trim();

      // Upload Cover File if selected
      if (selectedCoverFile) {
        const coverData = new FormData();
        coverData.append("file", selectedCoverFile);
        const res = await fetch("/api/upload", { method: "POST", body: coverData });
        if (res.ok) {
          const json = await res.json();
          finalCoverUrl = json.url;
        }
      }

      // Upload Content File if selected
      if (selectedContentFile) {
        const contentData = new FormData();
        contentData.append("file", selectedContentFile);
        const res = await fetch("/api/upload", { method: "POST", body: contentData });
        if (res.ok) {
          const json = await res.json();
          finalContentUrl = json.url;
        }
      }

      const formData = new FormData();
      formData.append("id", item.id);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("level", level);
      formData.append("language", language);
      formData.append("hasPrice", hasPrice ? "true" : "false");
      formData.append("price", price);
      formData.append("coverImageUrl", finalCoverUrl);
      formData.append("contentUrl", finalContentUrl);
      formData.append("durationHours", durationHours);
      formData.append("durationMins", durationMins);

      const res = await updateStoreItem(undefined, formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setOpen(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 rounded-full gap-1 text-xs">
          <Edit className="size-3.5" /> Edit Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Edit Store Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor={`edit-item-title-${item.id}`} className="text-xs font-medium">
                Product Title
              </Label>
              <Input
                id={`edit-item-title-${item.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-item-type-${item.id}`} className="text-xs font-medium">
                Type
              </Label>
              <select
                id={`edit-item-type-${item.id}`}
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isSubmitting}
              >
                <option value="COURSE">Course</option>
                <option value="DOCUMENT">Document</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
                <option value="HISTORICAL_STORY">Historical Story</option>
              </select>
            </div>

            {/* Level */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-item-level-${item.id}`} className="text-xs font-medium">
                Level
              </Label>
              <select
                id={`edit-item-level-${item.id}`}
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isSubmitting}
              >
                <option value="ALL_LEVELS">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            {/* Language */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-item-lang-${item.id}`} className="text-xs font-medium">
                Language
              </Label>
              <select
                id={`edit-item-lang-${item.id}`}
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isSubmitting}
              >
                <option value="EN">English</option>
                <option value="UR">Urdu</option>
                <option value="AR">Arabic</option>
              </select>
            </div>

            {/* Price Checkbox & Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id={`edit-hasPrice-${item.id}`}
                  checked={hasPrice}
                  onCheckedChange={(checked) => setHasPrice(!!checked)}
                  disabled={isSubmitting}
                />
                <Label htmlFor={`edit-hasPrice-${item.id}`} className="text-xs font-medium">
                  This item has a price
                </Label>
              </div>

              {hasPrice && (
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`edit-price-${item.id}`} className="text-xs font-medium">
                    Price (£)
                  </Label>
                  <Input
                    id={`edit-price-${item.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="9.99"
                    className="h-9 text-xs"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor={`edit-desc-${item.id}`} className="text-xs font-medium">
                Description
              </Label>
              <Textarea
                id={`edit-desc-${item.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-xs"
                disabled={isSubmitting}
              />
            </div>

            {/* Duration (Hours & Mins) */}
            <div className="sm:col-span-2 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor={`edit-dur-h-${item.id}`} className="text-xs font-medium">
                  Duration (Hours)
                </Label>
                <Input
                  id={`edit-dur-h-${item.id}`}
                  type="number"
                  min="0"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="1"
                  className="h-9 text-xs"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`edit-dur-m-${item.id}`} className="text-xs font-medium">
                  Duration (Minutes)
                </Label>
                <Input
                  id={`edit-dur-m-${item.id}`}
                  type="number"
                  min="0"
                  max="59"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  placeholder="30"
                  className="h-9 text-xs"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Cover Image</Label>
              {selectedCoverFile ? (
                <div className="flex h-9 items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 text-xs">
                  <span className="flex items-center gap-1.5 truncate font-medium">
                    <ImageIcon className="size-3.5 text-primary" /> {selectedCoverFile.name}
                  </span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedCoverFile(null)} className="size-5">
                    <X className="size-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Label htmlFor={`edit-cover-${item.id}`} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs hover:bg-accent font-medium shrink-0">
                    <Upload className="size-3.5 text-primary" /> Choose Cover File...
                  </Label>
                  <input
                    type="file"
                    id={`edit-cover-${item.id}`}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setSelectedCoverFile(e.target.files[0])}
                  />
                  <Input
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="or paste image URL"
                    className="h-9 text-xs flex-1"
                  />
                </div>
              )}
            </div>

            {/* Content URL / File */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Main Content Document / Link</Label>
              {selectedContentFile ? (
                <div className="flex h-9 items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 text-xs">
                  <span className="flex items-center gap-1.5 truncate font-medium">
                    <FileText className="size-3.5 text-primary" /> {selectedContentFile.name}
                  </span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedContentFile(null)} className="size-5">
                    <X className="size-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Label htmlFor={`edit-content-${item.id}`} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs hover:bg-accent font-medium shrink-0">
                    <Upload className="size-3.5 text-primary" /> Choose Content File...
                  </Label>
                  <input
                    type="file"
                    id={`edit-content-${item.id}`}
                    accept=".pdf,.doc,.docx,.mp4,.mp3,.png,.jpg,.jpeg,.zip"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setSelectedContentFile(e.target.files[0])}
                  />
                  <Input
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    placeholder="or paste URL"
                    className="h-9 text-xs flex-1"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !title.trim()} className="rounded-full text-xs font-medium gap-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
