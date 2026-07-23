import { CalendarDays, CalendarClock, History, Users, ClipboardCheck, UserPlus, Trash2 } from "lucide-react";
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
import {
  cancelClassSession,
  addClassParticipant,
  removeClassParticipant,
  upsertAttendance,
} from "./actions";
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

  const [sessions, courses, teachers, students, allParticipants, recentAttendances] = await Promise.all([
    prisma.classSession.findMany({
      orderBy: { scheduledStart: "desc" },
      take: 100,
      select: {
        id: true,
        type: true,
        scheduledStart: true,
        scheduledEnd: true,
        status: true,
        course: { select: { id: true, name: true } },
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
    prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.classParticipant.findMany({
      include: { student: { select: { id: true, name: true } } },
    }),
    prisma.attendance.findMany({
      orderBy: { recordedAt: "desc" },
      take: 15,
      include: {
        student: { select: { name: true } },
        classSession: { select: { course: { select: { name: true } }, scheduledStart: true } },
        markedBy: { select: { name: true } },
      },
    }),
  ]);

  const upcoming = sessions
    .filter((s) => s.status === "SCHEDULED" || s.status === "LIVE")
    .sort((a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime());

  const past = sessions
    .filter((s) => s.status === "COMPLETED" || s.status === "CANCELLED")
    .sort((a, b) => b.scheduledStart.getTime() - a.scheduledStart.getTime());

  const scheduledSessions = upcoming.filter((s) => s.status === "SCHEDULED");
  const completedSessions = past.filter((s) => s.status === "COMPLETED");

  const participantsBySession = new Map<string, typeof allParticipants>();
  for (const p of allParticipants) {
    if (!participantsBySession.has(p.classSessionId)) {
      participantsBySession.set(p.classSessionId, []);
    }
    participantsBySession.get(p.classSessionId)!.push(p);
  }

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
            <CardTitle>{t("sched.scheduleClass")}</CardTitle>
            <CardDescription>{t("sched.scheduleClassDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 || courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {courses.length === 0
                  ? t("sched.noActiveCourses")
                  : t("sched.noVerifiedTeachers")}
              </p>
            ) : (
              <CreateSessionForm courses={courses} teachers={teachers} />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4" /> {t("sched.upcomingSessions")}
            </CardTitle>
            <CardDescription>
              {upcoming.length === 0
                ? t("sched.nothingScheduled")
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
                    <SubmitButton size="sm" variant="outline" className="rounded-full" pendingLabel={t("sched.cancelling")}>
                      {t("sched.cancel")}
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}

            {upcoming.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <CalendarDays className="size-6" />
                <span className="text-sm">{t("sched.noUpcomingSessions")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4" /> {t("sched.pastSessions")}
            </CardTitle>
            <CardDescription>
              {past.length === 0 ? t("sched.noHistory") : `${past.length} session${past.length === 1 ? "" : "s"}`}
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
              <p className="text-sm text-muted-foreground">{t("sched.noPastSessions")}</p>
            )}
          </CardContent>
        </Card>

        {/* Manage Participants */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" /> {t("sched.manageParticipants")}
            </CardTitle>
            <CardDescription>{t("sched.manageParticipantsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {scheduledSessions.length === 0 || students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {scheduledSessions.length === 0
                  ? t("sched.noScheduledSessions")
                  : t("sched.noActiveStudents")}
              </p>
            ) : (
              <form action={addClassParticipant} className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium leading-none">{t("sched.session")}</label>
                  <select
                    name="classSessionId"
                    required
                    className="flex h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">{t("sched.selectSession")}</option>
                    {scheduledSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.course.name} · {formatDateTime(s.scheduledStart)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium leading-none">{t("sched.student")}</label>
                  <select
                    name="studentUserId"
                    required
                    className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">{t("sched.selectStudent")}</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <SubmitButton className="rounded-full" pendingLabel={t("sched.adding")}>
                  <UserPlus className="size-3.5" /> {t("sched.addToSession")}
                </SubmitButton>
              </form>
            )}

            {scheduledSessions.some((s) => (participantsBySession.get(s.id)?.length ?? 0) > 0) && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">{t("sched.currentParticipants")}</p>
                {scheduledSessions.map((session) => {
                  const participants = participantsBySession.get(session.id) ?? [];
                  if (participants.length === 0) return null;
                  return (
                    <div key={session.id} className="flex flex-col gap-2 rounded-xl border border-border p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        {session.course.name} · {formatDateTime(session.scheduledStart)}
                      </p>
                      {participants.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <span className="text-sm">{p.student.name}</span>
                          <form action={removeClassParticipant}>
                            <input type="hidden" name="classSessionId" value={p.classSessionId} />
                            <input type="hidden" name="studentUserId" value={p.studentUserId} />
                            <SubmitButton
                              size="sm"
                              variant="outline"
                              className="rounded-full text-destructive hover:text-destructive"
                              pendingLabel={t("sched.removing")}
                            >
                              <Trash2 className="size-3.5" /> {t("sched.remove")}
                            </SubmitButton>
                          </form>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Override */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-4" /> {t("sched.markAttendance")}
            </CardTitle>
            <CardDescription>
              {t("sched.markAttendanceDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {completedSessions.length === 0 || students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {completedSessions.length === 0
                  ? t("sched.noCompletedSessions")
                  : t("sched.noActiveStudents")}
              </p>
            ) : (
              <form action={upsertAttendance} className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium leading-none">{t("sched.session")}</label>
                  <select
                    name="classSessionId"
                    required
                    className="flex h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">{t("sched.selectSession")}</option>
                    {completedSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.course.name} · {formatDateTime(s.scheduledStart)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium leading-none">{t("sched.student")}</label>
                  <select
                    name="studentUserId"
                    required
                    className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">{t("sched.selectStudent")}</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium leading-none">{t("sched.attendanceStatus")}</label>
                  <select
                    name="status"
                    defaultValue="PRESENT"
                    className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="PRESENT">{t("sched.present")}</option>
                    <option value="ABSENT">{t("sched.absent")}</option>
                    <option value="LATE">{t("sched.late")}</option>
                  </select>
                </div>
                <SubmitButton className="rounded-full" pendingLabel={t("sched.saving")}>
                  <ClipboardCheck className="size-3.5" /> {t("sched.saveAttendance")}
                </SubmitButton>
              </form>
            )}

            {recentAttendances.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">{t("sched.recentRecords")}</p>
                {recentAttendances.map((att) => (
                  <div key={att.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{att.student.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {att.classSession.course.name} · {formatDateTime(att.classSession.scheduledStart)} ·
                        {t("sched.markedBy")} {att.markedBy.name}
                      </span>
                    </div>
                    <Badge
                      variant={
                        att.status === "PRESENT" ? "default" : att.status === "LATE" ? "secondary" : "destructive"
                      }
                      className="shrink-0 rounded-full"
                    >
                      {att.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
