import { CalendarDays, CalendarClock, History, Film, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
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
import { markAttendance } from "./actions";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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

const attendanceMeta: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PRESENT: { label: "Present", variant: "default" },
  ABSENT: { label: "Absent", variant: "destructive" },
  LATE: { label: "Late", variant: "secondary" },
};

export default async function TeacherClassesPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.teacher");

  const sessions = await prisma.classSession.findMany({
    where: { teacherUserId: currentUser.id },
    orderBy: { scheduledStart: "desc" },
    take: 100,
    include: {
      course: { select: { name: true } },
      participants: { include: { student: { select: { id: true, name: true } } } },
      attendances: true,
      recording: true,
    },
  });

  const upcoming = sessions
    .filter((s) => s.status === "SCHEDULED" || s.status === "LIVE")
    .sort((a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime());

  const past = sessions
    .filter((s) => s.status === "COMPLETED" || s.status === "CANCELLED")
    .sort((a, b) => b.scheduledStart.getTime() - a.scheduledStart.getTime());

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("classes")}
      description={t("classesDesc")}
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4" /> Upcoming Sessions
            </CardTitle>
            <CardDescription>
              {upcoming.length === 0 ? "Nothing scheduled." : `${upcoming.length} session${upcoming.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcoming.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    {session.course.name} · {typeLabel[session.type]}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(session.scheduledStart)} – {formatDateTime(session.scheduledEnd)}</span>
                </div>
                <div className="flex items-center gap-3">
                  {session.participants.length > 0 && (
                    <AvatarGroup>
                      {session.participants.slice(0, 4).map((p) => (
                        <Avatar key={p.id} size="sm">
                          <AvatarFallback>{initials(p.student.name)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {session.participants.length > 4 && (
                        <AvatarGroupCount>+{session.participants.length - 4}</AvatarGroupCount>
                      )}
                    </AvatarGroup>
                  )}
                  <Badge variant={statusVariant[session.status]} className="rounded-full">
                    {session.status}
                  </Badge>
                </div>
              </div>
            ))}

            {upcoming.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <CalendarDays className="size-6" />
                <span className="text-sm">No upcoming sessions.</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4" /> Past Sessions & Attendance
            </CardTitle>
            <CardDescription>
              {past.length === 0 ? "No history yet." : `${past.length} session${past.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {past.map((session) => {
              const attendanceByStudent = new Map(session.attendances.map((a) => [a.studentUserId, a.status]));
              return (
                <div key={session.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">
                        {session.course.name} · {typeLabel[session.type]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(session.scheduledStart)} – {formatDateTime(session.scheduledEnd)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.recording && (
                        <Badge variant="outline" className="rounded-full">
                          <Film className="size-3" /> Recording
                        </Badge>
                      )}
                      <Badge variant={statusVariant[session.status]} className="rounded-full">
                        {session.status}
                      </Badge>
                    </div>
                  </div>

                  {session.status === "COMPLETED" && (
                    <div className="flex flex-col gap-2 border-t border-border pt-3">
                      {session.participants.length === 0 && (
                        <p className="text-sm text-muted-foreground">No participants on this session.</p>
                      )}
                      {session.participants.map((participant) => {
                        const current = attendanceByStudent.get(participant.student.id);
                        return (
                          <div key={participant.id} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-sm">
                              <Avatar size="sm">
                                <AvatarFallback>{initials(participant.student.name)}</AvatarFallback>
                              </Avatar>
                              {participant.student.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {(["PRESENT", "LATE", "ABSENT"] as const).map((status) => (
                                <form key={status} action={markAttendance}>
                                  <input type="hidden" name="classSessionId" value={session.id} />
                                  <input type="hidden" name="studentUserId" value={participant.student.id} />
                                  <input type="hidden" name="status" value={status} />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    variant={current === status ? attendanceMeta[status].variant : "outline"}
                                    className="rounded-full"
                                  >
                                    {attendanceMeta[status].label}
                                  </Button>
                                </form>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {past.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <User className="size-6" />
                <span className="text-sm">No past sessions yet.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
