"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  BookOpen, FileText, Video, Music, Scroll, Clock, Globe,
  Search, LayoutGrid, List, Sparkles, X, Filter, SlidersHorizontal,
  ChevronRight, ShieldCheck, CheckCircle2, User, Eye, ArrowUpRight
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
  DialogHeader,
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

const coverGradients: Record<string, string> = {
  COURSE: "from-emerald-600/25 via-teal-600/15 to-primary/10",
  DOCUMENT: "from-blue-600/25 via-indigo-600/15 to-primary/10",
  VIDEO: "from-violet-600/25 via-purple-600/15 to-primary/10",
  AUDIO: "from-amber-600/25 via-orange-600/15 to-primary/10",
  HISTORICAL_STORY: "from-rose-600/25 via-pink-600/15 to-primary/10",
};

const levelBadgeStyles: Record<string, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  ADVANCED: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
  ALL_LEVELS: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc" | "duration">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeItem, setActiveItem] = useState<StoreItemWithRelations | null>(null);

  // Type filter definitions
  const typeFilters = useMemo(
    () => [
      { id: "all", label: t("filters.all"), Icon: LayoutGrid },
      { id: "COURSE", label: t("filters.COURSE"), Icon: BookOpen },
      { id: "DOCUMENT", label: t("filters.DOCUMENT"), Icon: FileText },
      { id: "VIDEO", label: t("filters.VIDEO"), Icon: Video },
      { id: "AUDIO", label: t("filters.AUDIO"), Icon: Music },
      { id: "HISTORICAL_STORY", label: t("filters.HISTORICAL_STORY"), Icon: Scroll },
    ],
    [t]
  );

  // Filter & sort calculation
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Type filter
        if (selectedType !== "all" && item.type !== selectedType) return false;
        // Level filter
        if (selectedLevel !== "all" && item.level !== selectedLevel) return false;
        // Price filter
        if (selectedPrice === "free" && item.pricePence !== 0) return false;
        if (selectedPrice === "paid" && item.pricePence === 0) return false;
        // Search query
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
        // Default newest
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [items, selectedType, selectedLevel, selectedPrice, searchQuery, sortBy]);

  // Counts by type for badges
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
      {/* Hero Section with Ambient Glow */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/95 via-primary to-primary/90 px-4 py-14 text-primary-foreground sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-20 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <Badge
            variant="outline"
            className="mb-4 inline-flex items-center gap-1.5 border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-md"
          >
            <Sparkles className="size-3.5 text-amber-300" />
            {t("heroBadge")}
          </Badge>

          <h1 className="font-heading text-3xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
            {t("heroSubtitle")}
          </p>

          {/* Interactive Search Bar */}
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/15 p-2 shadow-2xl backdrop-blur-md transition-all focus-within:border-primary-foreground/50 focus-within:ring-2 focus-within:ring-primary-foreground/30">
            <Search className="ms-3 size-5 shrink-0 text-primary-foreground/70" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-10 border-0 bg-transparent text-sm text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="size-8 rounded-full text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Controls Header & Filters Bar */}
        <div className="mb-8 flex flex-col gap-5">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
            {typeFilters.map(({ id, label, Icon }) => {
              const isActive = selectedType === id;
              const count = typeCounts[id] ?? 0;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedType(id)}
                  className={[
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm scale-105"
                      : "border-border/80 bg-card text-muted-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                  <span
                    className={[
                      "ms-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Level, Price, Sorting, View Mode */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* Level Filter */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Filter className="size-3.5" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">{t("levels.all")}</option>
                  <option value="BEGINNER">{t("levels.BEGINNER")}</option>
                  <option value="INTERMEDIATE">{t("levels.INTERMEDIATE")}</option>
                  <option value="ADVANCED">{t("levels.ADVANCED")}</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">{t("priceFilter.all")}</option>
                  <option value="free">{t("priceFilter.free")}</option>
                  <option value="paid">{t("priceFilter.paid")}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">{t("sort.newest")}</option>
                  <option value="priceAsc">{t("sort.priceAsc")}</option>
                  <option value="priceDesc">{t("sort.priceDesc")}</option>
                  <option value="duration">{t("sort.duration")}</option>
                </select>
              </div>

              {/* Layout Mode Toggle */}
              <div className="flex items-center rounded-lg border border-border/80 bg-muted/50 p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={[
                    "rounded-md p-1.5 transition-colors",
                    viewMode === "grid" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={[
                    "rounded-md p-1.5 transition-colors",
                    viewMode === "list" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">Active Filters:</span>
              {selectedType !== "all" && (
                <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-0.5">
                  Type: {typeFilters.find((f) => f.id === selectedType)?.label}
                  <X className="size-3 cursor-pointer" onClick={() => setSelectedType("all")} />
                </Badge>
              )}
              {selectedLevel !== "all" && (
                <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-0.5">
                  Level: {t(`levels.${selectedLevel}` as any)}
                  <X className="size-3 cursor-pointer" onClick={() => setSelectedLevel("all")} />
                </Badge>
              )}
              {selectedPrice !== "all" && (
                <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-0.5">
                  Price: {t(`priceFilter.${selectedPrice}` as any)}
                  <X className="size-3 cursor-pointer" onClick={() => setSelectedPrice("all")} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-0.5">
                  Search: "{searchQuery}"
                  <X className="size-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {t("emptyState.clearFilters")}
              </Button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {hasActiveFilters
              ? t("status.showingFiltered", { count: filteredItems.length })
              : filteredItems.length === 1
              ? t("status.itemCount", { count: 1 })
              : t("status.itemCountPlural", { count: filteredItems.length })}
          </p>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="my-12 flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center backdrop-blur-xs">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Search className="size-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-heading text-lg font-bold text-foreground">
                {items.length === 0 ? t("emptyState.noPublishedTitle") : t("emptyState.title")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {items.length === 0 ? t("emptyState.noPublishedDesc") : t("emptyState.desc")}
              </p>
            </div>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" className="mt-2 rounded-full text-xs">
                {t("emptyState.clearFilters")}
              </Button>
            )}
          </div>
        )}

        {/* Items Grid View */}
        {viewMode === "grid" && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const TypeIcon = typeIcons[item.type] ?? BookOpen;
              const gradient = coverGradients[item.type] ?? "from-primary/20 to-primary/5";
              const isFree = item.pricePence === 0;

              return (
                <Card
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden border-border/70 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl dark:hover:shadow-primary/5"
                >
                  {/* Card Cover */}
                  <div className={`relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}>
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-6 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-background/80 shadow-md backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                          <TypeIcon className="size-7 text-primary" />
                        </div>
                        <p className="font-heading text-xs font-bold leading-tight text-foreground/80 line-clamp-2">
                          {item.title}
                        </p>
                      </div>
                    )}

                    {/* Top Overlay Badges */}
                    <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold text-foreground shadow-xs backdrop-blur-md border-border/80"
                      >
                        <TypeIcon className="size-3 text-primary" />
                        {t(`typeLabel.${item.type}` as any)}
                      </Badge>

                      <Badge
                        className={[
                          "rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-sm border",
                          isFree
                            ? "bg-emerald-500 text-white border-emerald-400 dark:bg-emerald-600"
                            : "bg-primary text-primary-foreground border-primary/40",
                        ].join(" ")}
                      >
                        {formatPrice(item.pricePence, t("cta.free"))}
                      </Badge>
                    </div>

                    {/* Quick Preview Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActiveItem(item)}
                        className="gap-1.5 rounded-full shadow-lg font-semibold text-xs"
                      >
                        <Eye className="size-3.5" />
                        {t("cta.quickView")}
                      </Button>
                    </div>
                  </div>

                  {/* Card Main Content */}
                  <CardContent className="flex flex-1 flex-col gap-3 p-5">
                    <div>
                      <h3
                        onClick={() => setActiveItem(item)}
                        className="line-clamp-2 font-heading text-base font-bold leading-snug text-foreground transition-colors hover:text-primary cursor-pointer"
                      >
                        {item.title}
                      </h3>
                    </div>

                    {item.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    )}

                    {/* Teacher Info */}
                    {item.createdBy && (
                      <div className="flex items-center gap-2 pt-1">
                        <Avatar className="size-6 border border-border">
                          <AvatarImage src={item.createdBy.image ?? ""} alt={item.createdBy.name ?? ""} />
                          <AvatarFallback className="text-[10px]">
                            {item.createdBy.name?.slice(0, 2).toUpperCase() ?? <User className="size-3" />}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] font-medium text-muted-foreground truncate">
                          {item.createdBy.name ?? "Qualified Instructor"}
                        </span>
                      </div>
                    )}

                    {/* Metadata Badges */}
                    <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${levelBadgeStyles[item.level]}`}
                      >
                        {t(`levels.${item.level}` as any)}
                      </Badge>

                      <Badge variant="outline" className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-muted-foreground">
                        <Globe className="size-2.5" />
                        {langLabelMap[item.language] ?? item.language}
                      </Badge>

                      {item.durationMins && item.durationMins > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-muted-foreground">
                          <Clock className="size-2.5" />
                          {formatDuration(item.durationMins)}
                        </Badge>
                      )}

                      {item.type === "COURSE" && item._count.modules > 0 && (
                        <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] text-primary/80 font-medium">
                          {item._count.modules} modules
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  {/* Card Footer Actions */}
                  <CardFooter className="flex items-center justify-between border-t border-border/60 p-4 bg-muted/20">
                    <span className="font-heading text-base font-bold text-primary">
                      {formatPrice(item.pricePence, t("cta.free"))}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setActiveItem(item)}
                      className="h-8 gap-1 rounded-full text-xs font-semibold shadow-xs"
                    >
                      <span>{t(`cta.${item.type}` as any)}</span>
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Items List View */}
        {viewMode === "list" && filteredItems.length > 0 && (
          <div className="flex flex-col gap-4">
            {filteredItems.map((item) => {
              const TypeIcon = typeIcons[item.type] ?? BookOpen;
              const isFree = item.pricePence === 0;

              return (
                <Card
                  key={item.id}
                  className="group flex flex-col overflow-hidden border-border/70 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg sm:flex-row"
                >
                  <div className="relative h-44 w-full shrink-0 overflow-hidden sm:w-64 bg-gradient-to-br from-primary/20 to-primary/5">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center p-4">
                        <TypeIcon className="size-10 text-primary/40" />
                      </div>
                    )}
                    <Badge variant="outline" className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 text-[10px] backdrop-blur-md">
                      <TypeIcon className="size-3" />
                      {t(`typeLabel.${item.type}` as any)}
                    </Badge>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <h3
                          onClick={() => setActiveItem(item)}
                          className="font-heading text-lg font-bold text-foreground hover:text-primary cursor-pointer"
                        >
                          {item.title}
                        </h3>
                        <span className="font-heading text-lg font-bold text-primary shrink-0">
                          {formatPrice(item.pricePence, t("cta.free"))}
                        </span>
                      </div>

                      {item.description && (
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={`rounded-full text-[10px] ${levelBadgeStyles[item.level]}`}>
                          {t(`levels.${item.level}` as any)}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 rounded-full text-[10px]">
                          <Globe className="size-2.5" />
                          {langLabelMap[item.language] ?? item.language}
                        </Badge>
                        {item.durationMins && (
                          <Badge variant="outline" className="flex items-center gap-1 rounded-full text-[10px]">
                            <Clock className="size-2.5" />
                            {formatDuration(item.durationMins)}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveItem(item)}
                          className="h-8 rounded-full text-xs"
                        >
                          {t("cta.quickView")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setActiveItem(item)}
                          className="h-8 gap-1 rounded-full text-xs font-semibold"
                        >
                          <span>{t(`cta.${item.type}` as any)}</span>
                          <ArrowUpRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick View Item Dialog Modal */}
        <Dialog open={!!activeItem} onOpenChange={(open) => !open && setActiveItem(null)}>
          {activeItem && (
            <DialogContent className="max-w-2xl overflow-hidden p-0 rounded-2xl border-border/80">
              {/* Modal Banner */}
              <div className={`relative flex h-52 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${coverGradients[activeItem.type] ?? "from-primary/20 to-primary/5"}`}>
                {activeItem.coverImageUrl ? (
                  <Image src={activeItem.coverImageUrl} alt={activeItem.title} fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-6">
                    {(() => {
                      const Icon = typeIcons[activeItem.type] ?? BookOpen;
                      return <Icon className="size-12 text-primary" />;
                    })()}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <Badge
                  className="absolute left-4 top-4 rounded-full bg-background/90 text-xs font-bold text-foreground backdrop-blur-md border border-border"
                >
                  {t(`typeLabel.${activeItem.type}` as any)}
                </Badge>
              </div>

              <div className="space-y-5 p-6 pt-2">
                {/* Modal Title & Description */}
                <div>
                  <DialogTitle className="font-heading text-2xl font-bold text-foreground">
                    {activeItem.title}
                  </DialogTitle>
                  {activeItem.description && (
                    <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {activeItem.description}
                    </DialogDescription>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold ${levelBadgeStyles[activeItem.level]}`}>
                    {t("modal.level")}: {t(`levels.${activeItem.level}` as any)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 rounded-full px-3 py-1 text-xs">
                    <Globe className="size-3" />
                    {t("modal.language")}: {langLabelMap[activeItem.language] ?? activeItem.language}
                  </Badge>
                  {activeItem.durationMins && (
                    <Badge variant="outline" className="flex items-center gap-1 rounded-full px-3 py-1 text-xs">
                      <Clock className="size-3" />
                      {t("modal.duration")}: {formatDuration(activeItem.durationMins)}
                    </Badge>
                  )}
                </div>

                {/* Teacher Info */}
                {activeItem.createdBy && (
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                    <Avatar className="size-10 border border-border">
                      <AvatarImage src={activeItem.createdBy.image ?? ""} alt={activeItem.createdBy.name ?? ""} />
                      <AvatarFallback>
                        {activeItem.createdBy.name?.slice(0, 2).toUpperCase() ?? <User className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("modal.by")}</p>
                      <p className="text-sm font-semibold text-foreground">{activeItem.createdBy.name ?? "Qualified Instructor"}</p>
                    </div>
                  </div>
                )}

                {/* Course Modules List Breakdown */}
                {activeItem.modules && activeItem.modules.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="font-heading text-sm font-bold text-foreground">
                      {t("modal.modulesCount", { count: activeItem.modules.length })}
                    </h4>
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-border/80 divide-y divide-border/60 bg-card">
                      {activeItem.modules.map((m, idx) => (
                        <div key={m.id} className="flex items-center justify-between p-3 text-xs hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-foreground">{m.title}</span>
                          </div>
                          {m.durationMins && (
                            <span className="text-[11px] text-muted-foreground shrink-0">{m.durationMins}m</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground block">{t("modal.priceItem")}</span>
                    <span className="font-heading text-2xl font-bold text-primary">
                      {formatPrice(activeItem.pricePence, t("cta.free"))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setActiveItem(null)} className="rounded-full text-xs">
                      {t("cta.close")}
                    </Button>
                    <Button
                      onClick={() => {
                        if (activeItem.contentUrl) {
                          window.open(activeItem.contentUrl, "_blank");
                        }
                      }}
                      className="gap-1.5 rounded-full text-xs font-semibold shadow-md"
                    >
                      <span>{t(`cta.${activeItem.type}` as any)}</span>
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>

      {/* Trust Strip */}
      <section className="border-t border-border bg-gradient-to-b from-muted/30 to-muted/60 px-4 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
          {[
            {
              icon: User,
              title: t("trust.teachers"),
              sub: t("trust.teachersSub"),
            },
            {
              icon: ShieldCheck,
              title: t("trust.payment"),
              sub: t("trust.paymentSub"),
            },
            {
              icon: CheckCircle2,
              title: t("trust.access"),
              sub: t("trust.accessSub"),
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-2 p-2">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <item.icon className="size-6" />
              </div>
              <p className="font-heading text-sm font-bold text-foreground">{item.title}</p>
              <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
