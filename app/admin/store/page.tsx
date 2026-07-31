import { ShoppingBag, Eye, EyeOff, Trash2, Plus, BookOpen, FileText, Video, Music, Scroll } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { CreateItemForm } from "./create-item-form";
import {
  toggleStoreItemPublished, deleteStoreItem,
  addStoreModule, deleteStoreModule,
} from "./actions";

const typeLabel: Record<string, string> = {
  COURSE: "Course", DOCUMENT: "Document", VIDEO: "Video",
  AUDIO: "Audio", HISTORICAL_STORY: "Historical Story",
};

const typeIcon: Record<string, React.ReactNode> = {
  COURSE:          <BookOpen className="size-3.5" />,
  DOCUMENT:        <FileText className="size-3.5" />,
  VIDEO:           <Video    className="size-3.5" />,
  AUDIO:           <Music    className="size-3.5" />,
  HISTORICAL_STORY:<Scroll   className="size-3.5" />,
};

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced", ALL_LEVELS: "All Levels",
};

function formatPrice(p: number) { return `£${(p / 100).toFixed(2)}`; }
function formatDuration(m: number | null) {
  if (!m) return null;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ""}`.trim() : `${m}m`;
}

export default async function AdminStorePage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const items = await prisma.storeItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      modules:   { orderBy: { moduleOrder: "asc" } },
    },
  });

  const published = items.filter((i) => i.isPublished).length;

  return (
    <DashboardShell
      role="admin" roleLabel={roleLabel[user.role]} userName={user.name}
      title="Curriculum Store"
      description="Manage courses, documents, videos, audios, and historical stories sold on the public store."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
            <CardDescription>Create a course, document, video, audio, or historical story listing.</CardDescription>
          </CardHeader>
          <CardContent><CreateItemForm /></CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-4" /> All Items
            </CardTitle>
            <CardDescription>
              {items.length} item{items.length !== 1 ? "s" : ""} total &middot; {published} published
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">No items yet. Add your first one above.</p>
            )}

            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                {/* Item header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium leading-tight">{item.title}</span>
                      <Badge variant="outline" className="flex items-center gap-1 rounded-full text-[10px]">
                        {typeIcon[item.type]} {typeLabel[item.type]}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {levelLabel[item.level]} &middot; {item.language}
                      {item.durationMins ? ` · ${formatDuration(item.durationMins)}` : ""}
                      &middot; {formatPrice(item.pricePence)}
                      &middot; by {item.createdBy.name}
                    </span>
                    {item.description && (
                      <span className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                  <Badge variant={item.isPublished ? "secondary" : "outline"} className="shrink-0 rounded-full">
                    {item.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>

                {/* Modules (courses only) */}
                {item.type === "COURSE" && (
                  <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Modules ({item.modules.length})
                    </p>

                    {item.modules.map((mod, idx) => (
                      <div key={mod.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2">
                        <span className="text-sm">
                          <span className="mr-2 text-xs text-muted-foreground">{idx + 1}.</span>
                          {mod.title}
                          {mod.durationMins && (
                            <span className="ml-2 text-xs text-muted-foreground">{formatDuration(mod.durationMins)}</span>
                          )}
                        </span>
                        <form action={deleteStoreModule}>
                          <input type="hidden" name="id" value={mod.id} />
                          <Button type="submit" variant="ghost" size="sm"
                            className="size-7 rounded-full p-0 text-destructive hover:text-destructive">
                            <Trash2 className="size-3" />
                          </Button>
                        </form>
                      </div>
                    ))}

                    {/* Add module form */}
                    <form action={addStoreModule} className="flex flex-col gap-2 border-t border-border pt-2 mt-1">
                      <input type="hidden" name="storeItemId" value={item.id} />
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <Label htmlFor={`mod-title-${item.id}`} className="text-xs">Module Title</Label>
                          <Input id={`mod-title-${item.id}`} name="title" placeholder="e.g. Introduction to Makharij" className="h-8 text-xs" required />
                        </div>
                        <div>
                          <Label htmlFor={`mod-dur-${item.id}`} className="text-xs">Duration (min)</Label>
                          <Input id={`mod-dur-${item.id}`} name="durationMins" type="number" min="1" placeholder="20" className="h-8 text-xs" />
                        </div>
                        <div className="sm:col-span-3">
                          <Label htmlFor={`mod-url-${item.id}`} className="text-xs">Content URL (optional)</Label>
                          <Input id={`mod-url-${item.id}`} name="contentUrl" type="url" placeholder="https://…" className="h-8 text-xs" />
                        </div>
                      </div>
                      <Button type="submit" variant="outline" size="sm" className="w-fit rounded-full gap-1">
                        <Plus className="size-3" /> Add Module
                      </Button>
                    </form>
                  </div>
                )}

                {/* Item actions */}
                <div className="flex gap-2 border-t border-border pt-2">
                  <form action={toggleStoreItemPublished}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="isPublished" value={String(item.isPublished)} />
                    <Button type="submit" variant="outline" size="sm" className="gap-1 rounded-full">
                      {item.isPublished
                        ? <><EyeOff className="size-3.5" /> Unpublish</>
                        : <><Eye    className="size-3.5" /> Publish</>}
                    </Button>
                  </form>
                  <form action={deleteStoreItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" variant="ghost" size="sm"
                      className="gap-1 rounded-full text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" /> Delete
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
