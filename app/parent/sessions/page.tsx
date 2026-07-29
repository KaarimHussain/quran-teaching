import { Video, ExternalLink, CalendarClock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";

export default async function ParentSessionsPage() {
  const user = await requireCurrentUser();
  if (user.role !== "PARENT") throw new Error("Forbidden");

  const observations = await prisma.parentSessionObserver.findMany({
    where: { parentUserId: user.id },
    orderBy: { classSession: { scheduledStart: "desc" } },
    include: {
      classSession: {
        include: {
          course: { select: { name: true } },
          teacher: { select: { name: true } },
        },
      },
    },
  });

  const now = new Date();
  const upcoming = observations.filter(
    (o) => o.classSession.scheduledStart >= now && o.classSession.status !== "CANCELLED"
  );
  const past = observations.filter(
    (o) => o.classSession.scheduledStart < now || o.classSession.status === "CANCELLED"
  );

  function SessionCard({ obs }: { obs: (typeof observations)[number] }) {
    const s = obs.classSession;
    const isLive = s.status === "LIVE";
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{s.course.name}</span>
            <span className="text-xs text-muted-foreground">with {s.teacher.name}</span>
          </div>
          <Badge
            variant={
              s.status === "LIVE" ? "default" : s.status === "CANCELLED" ? "destructive" : "secondary"
            }
          >
            {s.status}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" />
          {new Date(s.scheduledStart).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        {s.parentJoinUrl ? (
          <Button asChild size="sm" className="self-start rounded-full" variant={isLive ? "default" : "outline"}>
            <a href={s.parentJoinUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              {isLive ? "Join Now (Live)" : "Observer Link"}
            </a>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Observer link not set yet — contact the admin.
          </p>
        )}
      </div>
    );
  }

  return (
    <DashboardShell
      role="parent"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Live Class Access"
      description="Sessions you have been granted observer access to."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="size-4" /> Upcoming Sessions
            </CardTitle>
            <CardDescription>
              {upcoming.length === 0 ? "No upcoming sessions." : `${upcoming.length} session${upcoming.length === 1 ? "" : "s"} scheduled.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ask an administrator to add you as an observer for your child&apos;s class.
              </p>
            )}
            {upcoming.map((o) => <SessionCard key={o.id} obs={o} />)}
          </CardContent>
        </Card>

        {past.length > 0 && (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Past Sessions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {past.map((o) => <SessionCard key={o.id} obs={o} />)}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
