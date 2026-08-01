"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  BookOpen, FileText, Video, Music, Scroll, Clock, Globe,
  Search, LayoutGrid, List, Sparkles, X, Filter, SlidersHorizontal,
  ShieldCheck, CheckCircle2, User, Eye, ArrowUpRight
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type StoreItemWithRelations = {
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
  isPublished: boolean;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdByUserId: string;
  createdBy: {
    name: string | null;
    image?: string | null;
    role: string;
  };
  _count: {
    modules: number;
  };
  modules: {
    id: string;
    title: string;
    description: string | null;
    moduleOrder: number;
    durationMins: number | null;
    contentUrl: string | null;
  }[];
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  COURSE: BookOpen,
  DOCUMENT: FileText,
  VIDEO: Video,
  AUDIO: Music,
  HISTORICAL_STORY: Scroll,
};

const levelBadgeStyles: Record<string, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  INTERMEDIATE: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  ADVANCED: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  ALL_LEVELS: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
};

const langLabelMap: Record<string, string> = {
  EN: "English",
  UR: "اردو",
  AR: "العربية",
};

function formatPrice(pence: number, freeText: string) {
  if (pence === 0) return freeText;
  return `£${(pence / 100).toFixed(2)}`;
}

function formatDuration(m: number | null) {
  if (!m || m <= 0) return null;
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  }
  return `${mins}m`;
}

interface StoreClientProps {
  items: StoreItemWithRelations[];
}

export function StoreClient({ items }: StoreClientProps) {
  const t = useTranslations("pages.publicStore");

  // Robust safe translation helper with instant English fallbacks to prevent raw key leaks
  const tr = (key: string, fallback: string) => {
    try {
      const res = t(key as any);
      if (!res || typeof res !== "string" || res.startsWith("pages.publicStore") || res.startsWith("PAGES.")) {
        return fallback;
      }
      return res;
    } catch {
      return fallback;
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc" | "duration">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeItem, setActiveItem] = useState<StoreItemWithRelations | null>(null);

  // Filter tab definitions
  const typeFilters = useMemo(
    () => [
      { id: "all", label: tr("filters.all", "All Items"), Icon: LayoutGrid },
      { id: "COURSE", label: tr("filters.COURSE", "Courses"), Icon: BookOpen },
      { id: "DOCUMENT", label: tr("filters.DOCUMENT", "Documents"), Icon: FileText },
      { id: "VIDEO", label: tr("filters.VIDEO", "Videos"), Icon: Video },
      { id: "AUDIO", label: tr("filters.AUDIO", "Audio"), Icon: Music },
      { id: "HISTORICAL_STORY", label: tr("filters.HISTORICAL_STORY", "History"), Icon: Scroll },
    ],
    [t]
  );

  // Filter & sort logic
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedType !== "all" && item.type !== selectedType) return false;
        if (selectedLevel !== "all" && item.level !== selectedLevel) return false;
        if (selectedPrice === "free" && item.pricePence !== 0) return false;
        if (selectedPrice === "paid" && item.pricePence === 0) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const titleMatch = item.title.toLowerCase().includes(q);
          const descMatch = item.description?.toLowerCase().includes(q) ?? false;
          const authorMatch = item.createdBy?.name?.toLowerCase().includes(q) ?? false;
          if (!titleMatch && !descMatch && !authorMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priceAsc") return a.pricePence - b.pricePence;
        if (sortBy === "priceDesc") return b.pricePence - a.pricePence;
        if (sortBy === "duration") return (b.durationMins ?? 0) - (a.durationMins ?? 0);
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [items, selectedType, selectedLevel, selectedPrice, searchQuery, sortBy]);

  // Item counts by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  }, [items]);

  const hasActiveFilters =
    selectedType !== "all" || selectedLevel !== "all" || selectedPrice !== "all" || searchQuery.trim() !== "";

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedLevel("all");
    setSelectedPrice("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Hero Section */}
      <section className="relative border-b border-border/80 bg-primary/95 px-4 py-8 text-primary-foreground sm:py-12">
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge
            variant="outline"
            className="mb-2 inline-flex items-center gap-1 border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-0.5 text-[11px] text-primary-foreground"
          >
            <Sparkles className="size-3 text-amber-300" />
            {tr("heroBadge", "Curriculum Marketplace")}
          </Badge>

          <h1 className="font-heading text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
            {tr("heroTitle", "Learn at Your Own Pace")}
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-xs text-primary-foreground/80 sm:text-sm">
            {tr("heroSubtitle", "Premium courses, documents, videos, audios, and historical stories crafted by qualified teachers.")}
          </p>

          {/* Compact Search Bar */}
          <div className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 shadow-sm backdrop-blur-xs">
            <Search className="size-4 shrink-0 text-primary-foreground/60" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr("searchPlaceholder", "Search courses, topics, teachers...")}
              className="h-8 border-0 bg-transparent text-xs text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="size-6 rounded-full text-primary-foreground/70 hover:bg-primary-foreground/20"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Compact Filters & Controls */}
        <div className="mb-6 flex flex-col gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
            {typeFilters.map(({ id, label, Icon }) => {
              const isActive = selectedType === id;
              const count = typeCounts[id] ?? 0;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedType(id)}
                  className={[
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-2xs font-semibold"
                      : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-3.5" />
                  <span>{label}</span>
                  <span
                    className={[
                      "ms-0.5 rounded-full px-1.5 py-0.2 text-[10px]",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-2 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Filter className="size-3 text-muted-foreground" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">{tr("levels.all", "All Levels")}</option>
                  <option value="BEGINNER">{tr("levels.BEGINNER", "Beginner")}</option>
                  <option value="INTERMEDIATE">{tr("levels.INTERMEDIATE", "Intermediate")}</option>
                  <option value="ADVANCED">{tr("levels.ADVANCED", "Advanced")}</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">{tr("priceFilter.all", "All Prices")}</option>
                  <option value="free">{tr("priceFilter.free", "Free Only")}</option>
                  <option value="paid">{tr("priceFilter.paid", "Paid Only")}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <SlidersHorizontal className="size-3 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">{tr("sort.newest", "Newest")}</option>
                  <option value="priceAsc">{tr("sort.priceAsc", "Price: Low to High")}</option>
                  <option value="priceDesc">{tr("sort.priceDesc", "Price: High to Low")}</option>
                  <option value="duration">{tr("sort.duration", "Duration")}</option>
                </select>
              </div>

              <div className="flex items-center rounded-md border border-border/80 bg-muted/40 p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={[
                    "rounded p-1 transition-colors",
                    viewMode === "grid" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={[
                    "rounded p-1 transition-colors",
                    viewMode === "list" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <List className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-muted-foreground">Active Filters:</span>
              {selectedType !== "all" && (
                <Badge variant="secondary" className="gap-1 rounded-full px-2 py-0.5 text-[10px]">
                  Type: {typeFilters.find((f) => f.id === selectedType)?.label}
                  <X className="size-3 cursor-pointer" onClick={() => setSelectedType("all")} />
                </Badge>
              )}
              {selectedLevel !== "all" && (
                <Badge variant="secondary" className="gap-1 rounded-full px-2 py-0.5 text-[10px]">
                  Level: {tr(`levels.${selectedLevel}`, selectedLevel)}
                  <X className="size-3 cursor-pointer" onClick={() => setSelectedLevel("all")} />
                </Badge>
              )}
              {selectedPrice !== "all" && (
                <Badge variant="secondary" className="gap-1 rounded-full px-2 py-0.5 text-[10px]">
                  Price: {tr(`priceFilter.${selectedPrice}`, selectedPrice)}
                  <X className="size-3 cursor-pointer" onClick={() => setSelectedPrice("all")} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 rounded-full px-2 py-0.5 text-[10px]">
                  Search: "{searchQuery}"
                  <X className="size-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-5 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                {tr("emptyState.clearFilters", "Clear Filters")}
              </Button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {hasActiveFilters
              ? tr("status.showingFiltered", `Showing ${filteredItems.length} matching item(s)`).replace("{count}", String(filteredItems.length))
              : filteredItems.length === 1
                ? tr("status.itemCount", "1 item available").replace("{count}", "1")
                : tr("status.itemCountPlural", `${filteredItems.length} items available`).replace("{count}", String(filteredItems.length))}
          </p>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="my-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Search className="size-6" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="font-heading text-base font-bold text-foreground">
                {items.length === 0 ? tr("emptyState.noPublishedTitle", "Nothing listed yet") : tr("emptyState.title", "No products match your criteria")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {items.length === 0 ? tr("emptyState.noPublishedDesc", "Check back soon!") : tr("emptyState.desc", "Try clearing your search query or changing filters.")}
              </p>
            </div>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm" className="mt-1 rounded-full text-xs h-7 px-3">
                {tr("emptyState.clearFilters", "Clear Filters")}
              </Button>
            )}
          </div>
        )}

        {/* Ultra-Compact Clean Grid View (Max 3 Columns) */}
        {viewMode === "grid" && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const TypeIcon = typeIcons[item.type] ?? BookOpen;
              const isFree = item.pricePence === 0;
              const freeText = tr("cta.free", "Free Access");

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card p-0 transition-all duration-200 hover:border-primary/50 hover:shadow-xs"
                >
                  {/* Slim Cover Box */}
                  <div className="relative flex h-28 w-full items-center justify-center overflow-hidden bg-muted/30 border-b border-border/50">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 text-center">
                        <div className="flex size-7 items-center justify-center rounded-md bg-background border border-border/60">
                          <TypeIcon className="size-3.5 text-primary" />
                        </div>
                        <p className="font-heading text-[10px] font-semibold leading-tight text-foreground/80 line-clamp-1">
                          {item.title}
                        </p>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-1">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 rounded-full bg-background/90 px-1.5 py-0 text-[9px] font-medium text-foreground border border-border/60"
                      >
                        <TypeIcon className="size-2.5 text-primary" />
                        {tr(`typeLabel.${item.type}`, item.type)}
                      </Badge>

                      <Badge
                        className={[
                          "rounded-full px-2 py-0 text-[9px] font-bold border shadow-2xs",
                          isFree
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-primary text-primary-foreground border-primary/40",
                        ].join(" ")}
                      >
                        {formatPrice(item.pricePence, freeText)}
                      </Badge>
                    </div>

                    {/* Quick Preview Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 backdrop-blur-2xs transition-opacity duration-200 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActiveItem(item)}
                        className="gap-1 rounded-full shadow-xs font-medium text-[10px] h-6 px-2"
                      >
                        <Eye className="size-3" />
                        {tr("cta.quickView", "Quick View")}
                      </Button>
                    </div>
                  </div>

                  {/* Ultra-Dense Body Content */}
                  <div className="flex flex-1 flex-col gap-1 p-2.5">
                    <div>
                      <h3
                        onClick={() => setActiveItem(item)}
                        className="line-clamp-1 font-heading text-xs font-bold leading-tight text-foreground transition-colors hover:text-primary cursor-pointer"
                      >
                        {item.title}
                      </h3>
                    </div>

                    {item.description && (
                      <p className="line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                        {item.description}
                      </p>
                    )}

                    {/* Instructor Info */}
                    {item.createdBy && (
                      <div className="flex items-center gap-1 pt-0.5">
                        <Avatar className="size-3.5 border border-border">
                          <AvatarImage src={item.createdBy.image ?? ""} alt={item.createdBy.name ?? ""} />
                          <AvatarFallback className="text-[7px]">
                            {item.createdBy.name?.slice(0, 2).toUpperCase() ?? <User className="size-2" />}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[9px] font-medium text-muted-foreground truncate">
                          {item.createdBy.name ?? "Qualified Instructor"}
                        </span>
                      </div>
                    )}

                    {/* Compact Metadata Badges */}
                    <div className="mt-auto flex flex-wrap items-center gap-1 pt-0.5">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-1.5 py-0 text-[8px] font-medium ${levelBadgeStyles[item.level]}`}
                      >
                        {tr(`levels.${item.level}`, item.level)}
                      </Badge>

                      <Badge variant="outline" className="flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[8px] text-muted-foreground">
                        <Globe className="size-2" />
                        {langLabelMap[item.language] ?? item.language}
                      </Badge>

                      {item.durationMins && item.durationMins > 0 && (
                        <Badge variant="outline" className="flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[8px] text-muted-foreground">
                          <Clock className="size-2" />
                          {formatDuration(item.durationMins)}
                        </Badge>
                      )}

                      {item.type === "COURSE" && item._count.modules > 0 && (
                        <Badge variant="outline" className="rounded-full px-1.5 py-0 text-[8px] text-primary/80 font-medium">
                          {item._count.modules} modules
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Dense Footer */}
                  <div className="flex items-center justify-between border-t border-border/50 px-2.5 py-1.5 bg-muted/10">
                    <span className="font-heading text-xs font-bold text-primary">
                      {formatPrice(item.pricePence, freeText)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setActiveItem(item)}
                      className="h-5.5 gap-1 rounded-full text-[9px] font-medium px-2"
                    >
                      <span>{tr(`cta.${item.type}`, "Get")}</span>
                      <ArrowUpRight className="size-2.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compact List View */}
        {viewMode === "list" && filteredItems.length > 0 && (
          <div className="flex flex-col gap-3">
            {filteredItems.map((item) => {
              const TypeIcon = typeIcons[item.type] ?? BookOpen;
              const isFree = item.pricePence === 0;
              const freeText = tr("cta.free", "Free Access");

              return (
                <div
                  key={item.id}
                  className="group flex flex-col overflow-hidden border-border/80 bg-card transition-all duration-200 hover:border-primary/40 sm:flex-row"
                >
                  <div className="relative w-full shrink-0 overflow-hidden sm:w-48 bg-muted/40 dark:bg-muted/20 border-b sm:border-b-0 sm:border-r border-border/60">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center p-3">
                        <TypeIcon className="size-8 text-primary/40" />
                      </div>
                    )}
                    <Badge variant="secondary" className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/90 text-[9px]">
                      <TypeIcon className="size-2.5" />
                      {tr(`typeLabel.${item.type}`, item.type)}
                    </Badge>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          onClick={() => setActiveItem(item)}
                          className="font-heading text-xs font-bold text-foreground hover:text-primary cursor-pointer"
                        >
                          {item.title}
                        </h3>
                        <span className="font-heading text-xs font-bold text-primary shrink-0">
                          {formatPrice(item.pricePence, freeText)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={`rounded-full text-[9px] ${levelBadgeStyles[item.level]}`}>
                          {tr(`levels.${item.level}`, item.level)}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-0.5 rounded-full text-[9px]">
                          <Globe className="size-2" />
                          {langLabelMap[item.language] ?? item.language}
                        </Badge>
                        {item.durationMins && (
                          <Badge variant="outline" className="flex items-center gap-0.5 rounded-full text-[9px]">
                            <Clock className="size-2" />
                            {formatDuration(item.durationMins)}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveItem(item)}
                          className="h-6 rounded-full text-[10px] px-2"
                        >
                          {tr("cta.quickView", "Quick View")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setActiveItem(item)}
                          className="h-6 gap-1 rounded-full text-[10px] font-medium px-2.5"
                        >
                          <span>{tr(`cta.${item.type}`, "Get")}</span>
                          <ArrowUpRight className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick View Item Dialog Modal */}
        <Dialog open={!!activeItem} onOpenChange={(open) => !open && setActiveItem(null)}>
          {activeItem && (
            <DialogContent className="max-w-xl overflow-hidden p-0 rounded-2xl border-border/80">
              {/* Modal Banner */}
              <div className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-muted/40 dark:bg-muted/20 border-b border-border/60">
                {activeItem.coverImageUrl ? (
                  <Image src={activeItem.coverImageUrl} alt={activeItem.title} fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    {(() => {
                      const Icon = typeIcons[activeItem.type] ?? BookOpen;
                      return <Icon className="size-8 text-primary" />;
                    })()}
                  </div>
                )}
                <Badge
                  className="absolute left-3 top-3 rounded-full bg-background/90 text-[10px] font-bold text-foreground border border-border"
                >
                  {tr(`typeLabel.${activeItem.type}`, activeItem.type)}
                </Badge>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <DialogTitle className="font-heading text-lg font-bold text-foreground">
                    {activeItem.title}
                  </DialogTitle>
                  {activeItem.description && (
                    <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {activeItem.description}
                    </DialogDescription>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${levelBadgeStyles[activeItem.level]}`}>
                    {tr("modal.level", "Level")}: {tr(`levels.${activeItem.level}`, activeItem.level)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px]">
                    <Globe className="size-2.5" />
                    {tr("modal.language", "Language")}: {langLabelMap[activeItem.language] ?? activeItem.language}
                  </Badge>
                  {activeItem.durationMins && (
                    <Badge variant="outline" className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px]">
                      <Clock className="size-2.5" />
                      {tr("modal.duration", "Duration")}: {formatDuration(activeItem.durationMins)}
                    </Badge>
                  )}
                </div>

                {activeItem.createdBy && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                    <Avatar className="size-8 border border-border">
                      <AvatarImage src={activeItem.createdBy.image ?? ""} alt={activeItem.createdBy.name ?? ""} />
                      <AvatarFallback className="text-[10px]">
                        {activeItem.createdBy.name?.slice(0, 2).toUpperCase() ?? <User className="size-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{tr("modal.by", "Created by")}</p>
                      <p className="text-xs font-semibold text-foreground">{activeItem.createdBy.name ?? "Qualified Instructor"}</p>
                    </div>
                  </div>
                )}

                {activeItem.modules && activeItem.modules.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-heading text-xs font-bold text-foreground">
                      {tr("modal.modulesCount", `Included Modules (${activeItem.modules.length})`).replace("{count}", String(activeItem.modules.length))}
                    </h4>
                    <div className="max-h-36 overflow-y-auto rounded-lg border border-border/80 divide-y divide-border/60 bg-card">
                      {activeItem.modules.map((m, idx) => (
                        <div key={m.id} className="flex items-center justify-between p-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-foreground text-xs">{m.title}</span>
                          </div>
                          {m.durationMins && (
                            <span className="text-[10px] text-muted-foreground shrink-0">{m.durationMins}m</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">{tr("modal.priceItem", "Price")}</span>
                    <span className="font-heading text-lg font-bold text-primary">
                      {formatPrice(activeItem.pricePence, tr("cta.free", "Free Access"))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveItem(null)} className="rounded-full text-xs h-7 px-3">
                      {tr("cta.close", "Close")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (activeItem.contentUrl) {
                          window.open(activeItem.contentUrl, "_blank");
                        }
                      }}
                      className="gap-1 rounded-full text-xs font-medium h-7 px-3"
                    >
                      <span>{tr(`cta.${activeItem.type}`, "Get")}</span>
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>

      {/* Trust Strip */}
      <section className="border-t border-border bg-muted/20 px-4 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 text-center sm:grid-cols-3">
          {[
            {
              icon: User,
              title: tr("trust.teachers", "Expert Teachers"),
              sub: tr("trust.teachersSub", "Content created by qualified Islamic scholars"),
            },
            {
              icon: ShieldCheck,
              title: tr("trust.payment", "Secure Access"),
              sub: tr("trust.paymentSub", "Instant verification & seamless learning"),
            },
            {
              icon: CheckCircle2,
              title: tr("trust.access", "Lifetime Access"),
              sub: tr("trust.accessSub", "Learn anytime, revisit whenever you need"),
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-1.5 p-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <p className="font-heading text-xs font-bold text-foreground">{item.title}</p>
              <p className="max-w-xs text-[11px] text-muted-foreground leading-snug">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
