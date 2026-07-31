import Link from "next/link";
import {
  ShoppingBag, Eye, EyeOff, Trash2, Plus,
  BookOpen, FileText, Video, Music, Scroll, Package,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import {
  toggleStoreItemPublished, deleteStoreItem,
  addStoreModule, deleteStoreModule,
} from "./actions";

function formatPrice(pricePence: number, freeLabel: string) {
  if (pricePence === 0) return freeLabel;
  return `£${(pricePence / 100).toFixed(2)}`;
}

function formatDuration(m: number | null) {
  if (!m) return null;
  return m >= 60
    ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`
    : `${m}m`;
}

const typeIcon: Record<string, React.ReactNode> = {
  COURSE:           <BookOpen className="size-3.5" />,
  DOCUMENT:         <FileText className="size-3.5" />,
  VIDEO:            <Video    className="size-3.5" />,
  AUDIO:            <Music    className="size-3.5" />,
  HISTORICAL_STORY: <Scroll   className="size-3.5" />,
};

export default async function AdminStorePage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const t = await getTranslations("pages.admin.store");

  const items = await prisma.storeItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      modules:   { orderBy: { moduleOrder: "asc" } },
    },
  });

  const published = items.filter((i) => i.isPublished).length;
  const draft     = items.length - published;

  const typeLabel: Record<string, string> = {
    COURSE:           t("form.typeCourse"),
    DOCUMENT:         t("form.typeDocument"),
    VIDEO:            t("form.typeVideo"),
    AUDIO:            t("form.typeAudio"),
    HISTORICAL_STORY: t("form.typeStory"),
  };

  const levelLabel: Record<string, string> = {
    ALL_LEVELS:   t("form.levelAll"),
    BEGINNER:     t("form.levelBeginner"),
    INTERMEDIATE: t("form.levelIntermediate"),
    ADVANCED:     t("form.levelAdvanced"),
  };

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("title")}
      description={t("desc")}
    >
      <div className="flex flex-col gap-6">

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card data-slot="card" data-size="sm" className="border-border/80">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">{t("totalProducts")}</p>
                <p className="text-2xl font-semibold">{items.length}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package className="size-5" />
              </span>
            </CardContent>
          </Card>

          <Card data-slot="card" data-size="sm" className="border-border/80">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">{t("statPublished")}</p>
                <p className="text-2xl font-semibold">{published}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary/60 text-secondary-foreground">
                <Eye className="size-5" />
              </span>
            </CardContent>
          </Card>

          <Card data-slot="card" data-size="sm" className="border-border/80">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">{t("statDraft")}</p>
                <p className="text-2xl font-semibold">{draft}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <EyeOff className="size-5" />
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Product list */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-4" />
                {t("listTitle")}
              </CardTitle>
              <CardDescription>
                {t("listDesc", { count: items.length, published })}
              </CardDescription>
            </div>
            <Button asChild className="shrink-0 rounded-full gap-1.5">
              <Link href="/admin/store/new">
                <Plus className="size-4" />
                {t("addProduct")}
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {items.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
                <ShoppingBag className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{t("noItems")}</p>
                <Button asChild variant="outline" size="sm" className="rounded-full gap-1.5">
                  <Link href="/admin/store/new">
                    <Plus className="size-3.5" />
                    {t("addProduct")}
                  </Link>
                </Button>
              </div>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                {/* Item header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium leading-tight">{item.title}</span>
                      <Badge variant="outline" className="flex items-center gap-1 rounded-full text-[10px] shrink-0">
                        {typeIcon[item.type]} {typeLabel[item.type]}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {levelLabel[item.level]}
                      {" · "}
                      {item.language}
                      {item.durationMins ? ` · ${formatDuration(item.durationMins)}` : ""}
                      {" · "}
                      {formatPrice(item.pricePence, t("free"))}
                      {" · "}
                      {t("by")} {item.createdBy.name}
                    </span>
                    {item.description && (
                      <span className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                  <Badge
                    variant={item.isPublished ? "secondary" : "outline"}
                    className="shrink-0 rounded-full"
                  >
                    {item.isPublished ? t("published") : t("draft")}
                  </Badge>
                </div>

                {/* Modules (COURSE only) */}
                {item.type === "COURSE" && (
                  <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("modules", { count: item.modules.length })}
                    </p>

                    {item.modules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2"
                      >
                        <span className="text-sm">
                          <span className="me-2 text-xs text-muted-foreground">{idx + 1}.</span>
                          {mod.title}
                          {mod.durationMins && (
                            <span className="ms-2 text-xs text-muted-foreground">
                              {formatDuration(mod.durationMins)}
                            </span>
                          )}
                        </span>
                        <form action={deleteStoreModule}>
                          <input type="hidden" name="id" value={mod.id} />
                          <Button
                            type="submit" variant="ghost" size="sm"
                            className="size-7 rounded-full p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </form>
                      </div>
                    ))}

                    {/* Add module */}
                    <form
                      action={addStoreModule}
                      className="mt-1 flex flex-col gap-2 border-t border-border pt-2"
                    >
                      <input type="hidden" name="storeItemId" value={item.id} />
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="sm:col-span-2 flex flex-col gap-1">
                          <Label htmlFor={`mod-title-${item.id}`} className="text-xs">
                            {t("moduleTitle")}
                          </Label>
                          <Input
                            id={`mod-title-${item.id}`} name="title"
                            placeholder={t("moduleTitlePlaceholder")}
                            className="h-8 text-xs" required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`mod-dur-${item.id}`} className="text-xs">
                            {t("moduleDuration")}
                          </Label>
                          <Input
                            id={`mod-dur-${item.id}`} name="durationMins"
                            type="number" min="1" placeholder="20"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3 flex flex-col gap-1">
                          <Label htmlFor={`mod-url-${item.id}`} className="text-xs">
                            {t("moduleUrl")}
                          </Label>
                          <Input
                            id={`mod-url-${item.id}`} name="contentUrl"
                            type="url" placeholder="https://…"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit" variant="outline" size="sm"
                        className="w-fit rounded-full gap-1"
                      >
                        <Plus className="size-3" /> {t("addModule")}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Item actions */}
                <div className="flex gap-2 border-t border-border pt-2">
                  <form action={toggleStoreItemPublished}>
                    <input type="hidden" name="id"          value={item.id} />
                    <input type="hidden" name="isPublished" value={String(item.isPublished)} />
                    <Button
                      type="submit" variant="outline" size="sm"
                      className="gap-1.5 rounded-full"
                    >
                      {item.isPublished
                        ? <><EyeOff className="size-3.5" /> {t("unpublish")}</>
                        : <><Eye    className="size-3.5" /> {t("publish")}</>}
                    </Button>
                  </form>

                  <form action={deleteStoreItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button
                      type="submit" variant="ghost" size="sm"
                      className="gap-1.5 rounded-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" /> {t("delete")}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
