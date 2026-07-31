import Image from "next/image";
import {
  BookOpen, FileText, Video, Music, Scroll,
  Clock, Globe, GraduationCap, Search, LayoutGrid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { prisma } from "@/lib/db";

const typeLabel: Record<string, string> = {
  COURSE: "Course", DOCUMENT: "Document", VIDEO: "Video",
  AUDIO: "Audio", HISTORICAL_STORY: "Historical Story",
};

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  COURSE:          BookOpen,
  DOCUMENT:        FileText,
  VIDEO:           Video,
  AUDIO:           Music,
  HISTORICAL_STORY:Scroll,
};

const typeCTA: Record<string, string> = {
  COURSE: "Enroll Now", DOCUMENT: "Download", VIDEO: "Watch",
  AUDIO: "Listen", HISTORICAL_STORY: "Read",
};

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced", ALL_LEVELS: "All Levels",
};

const langLabel: Record<string, string> = { EN: "English", UR: "Urdu", AR: "Arabic" };

const coverGradients: Record<string, string> = {
  COURSE:          "from-primary/20 to-primary/5",
  DOCUMENT:        "from-secondary/30 to-secondary/5",
  VIDEO:           "from-chart-5/20 to-chart-5/5",
  AUDIO:           "from-accent/30 to-accent/5",
  HISTORICAL_STORY:"from-chart-4/20 to-chart-4/5",
};

const typeFilters = [
  { id: "all",            label: "All",              Icon: LayoutGrid },
  { id: "COURSE",         label: "Courses",          Icon: BookOpen },
  { id: "DOCUMENT",       label: "Documents",        Icon: FileText },
  { id: "VIDEO",          label: "Videos",           Icon: Video },
  { id: "AUDIO",          label: "Audio",            Icon: Music },
  { id: "HISTORICAL_STORY",label: "History",         Icon: Scroll },
];

function formatPrice(p: number) { return `£${(p / 100).toFixed(2)}`; }
function formatDuration(m: number | null) {
  if (!m) return null;
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ""}` : `${m}m`;
}

export default async function StorePage() {
  const items = await prisma.storeItem.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: { _count: { select: { modules: true } } },
  });

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-primary px-4 py-14 text-primary-foreground sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primary-foreground/5" />

          <div className="relative mx-auto max-w-6xl text-center">
            <Badge variant="outline" className="mb-4 border-primary-foreground/30 text-primary-foreground/80">
              Curriculum Marketplace
            </Badge>
            <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl lg:text-5xl">
              Learn at Your Own Pace
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/70 sm:text-base">
              Premium courses, documents, videos, audios, and historical stories &mdash;
              crafted by qualified teachers to deepen your Islamic knowledge.
            </p>

            <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 backdrop-blur-sm">
              <Search className="size-4 shrink-0 text-primary-foreground/60" />
              <Input
                placeholder="Search courses, topics, teachers…"
                className="border-0 bg-transparent text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {/* Type filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {typeFilters.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={[
                  "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  id === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary",
                ].join(" ")}
              >
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* Count header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl text-primary sm:text-2xl">
                {items.length === 0 ? "Coming Soon" : "Available Now"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""} available
              </p>
            </div>
            {items.length > 0 && (
              <select className="h-9 rounded-lg border border-input bg-card px-3 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option>Sort: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            )}
          </div>

          {/* Empty state */}
          {items.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
              <GraduationCap className="size-10 text-muted-foreground/50" />
              <p className="font-heading text-lg text-primary">Nothing listed yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Our teachers are preparing premium courses and resources. Check back soon!
              </p>
            </div>
          )}

          {/* Item grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const Icon = typeIcon[item.type] ?? BookOpen;
                const gradient = coverGradients[item.type] ?? "from-muted to-muted/5";
                return (
                  <Card key={item.id} className="group flex flex-col overflow-hidden border-border/80 transition-shadow hover:shadow-md">
                    {/* Cover */}
                    <div className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}>
                      {item.coverImageUrl ? (
                        <Image
                          src={item.coverImageUrl} alt={item.title} fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 px-6 text-center">
                          <Icon className="size-10 text-primary/30" />
                          <p className="font-heading text-sm font-bold leading-tight text-primary/60 line-clamp-2">
                            {item.title}
                          </p>
                        </div>
                      )}
                      <Badge variant="outline" className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/80 text-[10px] backdrop-blur-sm">
                        <Icon className="size-3" /> {typeLabel[item.type]}
                      </Badge>
                    </div>

                    <CardContent className="flex flex-1 flex-col gap-2 pt-4">
                      <div>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</h3>
                      </div>

                      {item.description && (
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                        <Badge variant="secondary" className="rounded-full text-[10px]">
                          {levelLabel[item.level]}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-0.5 rounded-full text-[10px]">
                          <Globe className="size-2.5" /> {langLabel[item.language] ?? item.language}
                        </Badge>
                        {item.durationMins && (
                          <Badge variant="outline" className="flex items-center gap-0.5 rounded-full text-[10px]">
                            <Clock className="size-2.5" /> {formatDuration(item.durationMins)}
                          </Badge>
                        )}
                        {item.type === "COURSE" && item._count.modules > 0 && (
                          <Badge variant="outline" className="rounded-full text-[10px]">
                            {item._count.modules} module{item._count.modules !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                      <span className="font-heading text-lg font-bold text-primary">
                        {formatPrice(item.pricePence)}
                      </span>
                      <Button size="sm" className="h-8 rounded-full text-xs">
                        {typeCTA[item.type] ?? "Get"}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Trust strip */}
        <section className="border-t border-border bg-muted/40 px-4 py-10">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 text-center sm:grid-cols-3">
            {[
              { emoji: "🎓", title: "Expert Teachers", sub: "Content created by qualified Islamic scholars" },
              { emoji: "🔒", title: "Secure Payment",  sub: "SSL encrypted, safe checkout" },
              { emoji: "♾️",  title: "Lifetime Access", sub: "Buy once, revisit whenever you need" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-1.5">
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
