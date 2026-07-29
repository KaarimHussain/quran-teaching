import { CalendarDays, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatDateTime } from "@/lib/format";
import { CreateEventForm } from "./create-event-form";
import { toggleEventPublished, deletePublicEvent } from "./actions";

const languageLabel: Record<string, string> = { EN: "English", UR: "Urdu", AR: "Arabic" };

export default async function AdminEventsPage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const events = await prisma.publicEvent.findMany({
    orderBy: { scheduledAt: "asc" },
    include: { host: { select: { name: true } } },
  });

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Webinars & Events"
      description="Create public webinars and workshops visible to all visitors."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>New Event</CardTitle>
            <CardDescription>Schedule a public webinar or workshop.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateEventForm />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4" /> All Events
            </CardTitle>
            <CardDescription>
              {events.length === 0 ? "No events yet." : `${events.length} event${events.length === 1 ? "" : "s"} total.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {events.map((event) => (
              <div key={event.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium leading-tight">{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(event.scheduledAt)} · {languageLabel[event.language]} · hosted by {event.host.name}
                    </span>
                    {event.description && (
                      <span className="text-sm text-muted-foreground">{event.description}</span>
                    )}
                    {event.joinUrl && (
                      <a
                        href={event.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" /> {event.joinUrl}
                      </a>
                    )}
                  </div>
                  <Badge variant={event.isPublished ? "secondary" : "outline"} className="rounded-full shrink-0">
                    {event.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex gap-2 border-t border-border pt-2">
                  <form action={toggleEventPublished}>
                    <input type="hidden" name="id" value={event.id} />
                    <input type="hidden" name="isPublished" value={String(event.isPublished)} />
                    <Button type="submit" variant="outline" size="sm" className="rounded-full gap-1">
                      {event.isPublished
                        ? <><EyeOff className="size-3.5" /> Unpublish</>
                        : <><Eye className="size-3.5" /> Publish</>}
                    </Button>
                  </form>
                  <form action={deletePublicEvent}>
                    <input type="hidden" name="id" value={event.id} />
                    <Button type="submit" variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive gap-1">
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-muted-foreground">No events yet. Create your first above.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
