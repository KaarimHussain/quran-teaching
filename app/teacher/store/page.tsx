import { ShoppingBag, Trash2, Clock, BookOpen, FileText, Video, Music, Scroll } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { CreateItemForm } from "./create-item-form";
import { deleteTeacherStoreItem } from "./actions";

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

export default async function TeacherStorePage() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") throw new Error("Forbidden");

  const items = await prisma.storeItem.findMany({
    where: { createdByUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { modules: true } } },
  });

  const published = items.filter((i) => i.isPublished).length;
  const pending   = items.filter((i) => !i.isPublished).length;

  return (
    <DashboardShell
      role="teacher" roleLabel={roleLabel[user.role]} userName={user.name}
      title="Curriculum Store"
      description="Submit courses, documents, videos, audios, and historical stories to be sold on the public store."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Submit a New Item</CardTitle>
            <CardDescription>
              Your submission will appear as a draft until an admin reviews and publishes it.
            </CardDescription>
          </CardHeader>
          <CardContent><CreateItemForm /></CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-4" /> My Submissions
            </CardTitle>
            <CardDescription>
              {items.length} submitted &middot; {published} published &middot; {pending} pending review
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">You haven&apos;t submitted any items yet.</p>
            )}
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium leading-tight">{item.title}</span>
                      <Badge variant="outline" className="flex items-center gap-1 rounded-full text-[10px]">
                        {typeIcon[item.type]} {typeLabel[item.type]}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {levelLabel[item.level]} &middot; {item.language} &middot; {formatPrice(item.pricePence)}
                      {item.type === "COURSE" && ` · ${item._count.modules} module${item._count.modules !== 1 ? "s" : ""}`}
                    </span>
                    {item.description && (
                      <span className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                  <Badge variant={item.isPublished ? "secondary" : "outline"} className="shrink-0 rounded-full">
                    {item.isPublished ? "Published" : (
                      <span className="flex items-center gap-1"><Clock className="size-3" /> Pending</span>
                    )}
                  </Badge>
                </div>

                {!item.isPublished && (
                  <div className="flex gap-2 border-t border-border pt-2">
                    <form action={deleteTeacherStoreItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" variant="ghost" size="sm"
                        className="gap-1 rounded-full text-destructive hover:text-destructive">
                        <Trash2 className="size-3.5" /> Remove
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
