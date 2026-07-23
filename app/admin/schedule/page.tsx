import { CalendarDays, CalendarClock, History } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
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
import { cancelClassSession } from "./actions";
import { CreateSessionForm } from "./create-session-form";

const typeLabel: Record<string, string> = {
  ONE_TO_ONE: "One-to-One",
  GROUP: "Group",
};

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  SCHEDULED: "secondary",
  LIVE: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

export default async function AdminSchedulePage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");

  const [sessions, courses, teachers] = await Promise.all([
    prisma.classSession.findMany({
      orderBy: { scheduledStart: "desc" },
      take: 100,
      select: {
        id: true,
        type: true,
        scheduledStart: true,
        scheduledEnd: true,
        status: true,
        course: { select: { name: true } },
        teacher: { select: { name: true } },
      },
    }),
    prisma.course.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { role: "TEACHER", verificationStatus: "VERIFIED", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const upcoming = sessions
    .filter((s) => s.status === "SCHEDULED" || s.status === "LIVE")
    .sort((a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime());

  const past = sessions
    .filter((s) => s.status === "COMPLETED" || s.status === "CANCELLED")
    .sort((a, b) => b.scheduledStart.getTime() - a.scheduledStart.getTime());

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("schedule")}
      description={t("scheduleDesc")}
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Schedule a Class</CardTitle>
            <CardDescription>Assign a verified teacher to a course</CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 || courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {courses.length === 0
                  ? "No active courses available — activate a course first."
                  : "No verified teachers available — approve a teacher application first."}
              </p>
            ) : (
              <CreateSessionForm courses={courses} teachers={teachers} />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4" /> Upcoming Sessions
            </CardTitle>
            <CardDescription>
              {upcoming.length === 0
                ? "Nothing scheduled."
                : `${upcoming.length} session${upcoming.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {upcoming.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    {session.course.name} · {typeLabel[session.type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.teacher.name} · {formatDateTime(session.scheduledStart)} –{" "}
                    {formatDateTime(session.scheduledEnd)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={statusVariant[session.status]} className="rounded-full">
                    {session.status}
                  </Badge>
                  <form action={cancelClassSession}>
                    <input type="hidden" name="sessionId" value={session.id} />
                    <SubmitButton size="sm" variant="outline" className="rounded-full" pendingLabel="Cancelling…">
                      Cancel
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}

            {upcoming.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <CalendarDays className="size-6" />
                <span className="text-sm">No upcoming sessions — schedule one above.</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4" /> Past Sessions
            </CardTitle>
            <CardDescription>
              {past.length === 0 ? "No history yet." : `${past.length} session${past.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {past.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    {session.course.name} · {typeLabel[session.type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.teacher.name} · {formatDateTime(session.scheduledStart)} –{" "}
                    {formatDateTime(session.scheduledEnd)}
                  </span>
                </div>
                <Badge variant={statusVariant[session.status]} className="shrink-0 rounded-full">
                  {session.status}
                </Badge>
              </div>
            ))}

            {past.length === 0 && (
              <p className="text-sm text-muted-foreground">No past sessions yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
