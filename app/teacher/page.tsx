import Link from "next/link";
import {
  Users,
  CalendarDays,
  ClipboardList,
  Award,
  ArrowRight,
  Clock,
  Video,
  CheckCircle2,
  FileClock,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { requireCurrentUser, verifySession } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { teacherCoursesWhere } from "@/lib/teacher";
import { formatDateTime } from "@/lib/format";
import { getTranslations } from "next-intl/server";

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

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const verificationMeta: Record<
  string,
  { label: string; icon: typeof ShieldCheck; className: string }
> = {
  VERIFIED: { label: "Verified Teacher", icon: ShieldCheck, className: "bg-primary text-primary-foreground" },
  PENDING: { label: "Verification Pending", icon: ShieldQuestion, className: "bg-accent/40 text-accent-foreground" },
  REJECTED: { label: "Verification Rejected", icon: ShieldAlert, className: "bg-destructive/10 text-destructive" },
};

export default async function TeacherDashboardPage() {
  // The JWT already carries the user id, so every query below can start in the
  // same round-trip as the user lookup instead of waiting on it.
  const { userId: teacherId } = await verifySession();
  const teacherCourses = teacherCoursesWhere(teacherId);

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    currentUser,
    t,
    activeStudents,
    classesThisWeek,
    pendingGradingCount,
    badgesCount,
    upcomingSessions,
    gradingQueue,
    enrollments,
    availability,
  ] = await Promise.all([
    requireCurrentUser(),
    getTranslations("pages.teacher"),
    prisma.enrollment.findMany({
      where: { course: teacherCourses, status: "ACTIVE" },
      distinct: ["studentUserId"],
      select: { studentUserId: true },
    }),
    prisma.classSession.count({
      where: { teacherUserId: teacherId, scheduledStart: { gte: now, lte: weekFromNow } },
    }),
    prisma.submission.count({
      where: { status: "SUBMITTED", assignment: { teacherUserId: teacherId } },
    }),
    prisma.teacherBadge.count({ where: { teacherUserId: teacherId } }),
    prisma.classSession.findMany({
      where: { teacherUserId: teacherId, scheduledStart: { gte: now } },
      orderBy: { scheduledStart: "asc" },
      take: 4,
      include: {
        course: { select: { name: true } },
        participants: { include: { student: { select: { name: true } } } },
      },
    }),
    prisma.submission.findMany({
      where: { status: "SUBMITTED", assignment: { teacherUserId: teacherId } },
      orderBy: { submittedAt: "desc" },
      take: 4,
      include: {
        assignment: { select: { title: true, course: { select: { name: true } } } },
        student: { select: { name: true } },
      },
    }),
    prisma.enrollment.findMany({
      where: { course: teacherCourses, status: "ACTIVE" },
      orderBy: { enrolledAt: "desc" },
      take: 6,
      include: { student: { select: { id: true, name: true } }, course: { select: { id: true, name: true } } },
    }),
    prisma.teacherAvailability.findMany({
      where: { teacherUserId: teacherId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  const progressEntries = enrollments.length
    ? await prisma.progressEntry.findMany({
        where: {
          studentUserId: { in: enrollments.map((e) => e.student.id) },
          courseId: { in: enrollments.map((e) => e.course.id) },
        },
        orderBy: { recordedAt: "desc" },
      })
    : [];

  const progressFor = (studentId: string, courseId: string) =>
    progressEntries.find((p) => p.studentUserId === studentId && p.courseId === courseId)?.percentComplete ?? 0;

  const stats = [
    { label: t("dash.activeStudents"), value: activeStudents.length, icon: Users, color: "bg-primary/10 text-primary" },
    { label: t("dash.classesThisWeek"), value: classesThisWeek, icon: CalendarDays, color: "bg-accent/20 text-accent-foreground" },
    { label: t("dash.pendingGrading"), value: pendingGradingCount, icon: ClipboardList, color: "bg-secondary/30 text-secondary-foreground" },
    { label: t("dash.badgesEarned"), value: badgesCount, icon: Award, color: "bg-chart-4/10 text-chart-4" },
  ];

  const verification = verificationMeta[currentUser.verificationStatus ?? "PENDING"];

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("dashboard")}
      description={t("dashboardDesc")}
    >
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} size="sm" className="border-border/80">
              <CardContent className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-xl text-primary">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Upcoming classes */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("dash.upcomingClasses")}</CardTitle>
                  <CardDescription>{t("dash.nextScheduledSessions")}</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/teacher/classes">
                    {t("dash.viewAll")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                        <Video className="size-5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {session.course.name} · {typeLabel[session.type]}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3.5" /> {formatDateTime(session.scheduledStart)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {session.participants.length > 0 && (
                        <AvatarGroup>
                          {session.participants.slice(0, 3).map((p) => (
                            <Avatar key={p.id} size="sm">
                              <AvatarFallback>{initials(p.student.name)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {session.participants.length > 3 && (
                            <AvatarGroupCount>+{session.participants.length - 3}</AvatarGroupCount>
                          )}
                        </AvatarGroup>
                      )}
                      <Badge variant="outline" className="w-fit rounded-full">
                        {typeLabel[session.type]}
                      </Badge>
                    </div>
                  </div>
                ))}

                {upcomingSessions.length === 0 && (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                    <CalendarDays className="size-6" />
                    <span className="text-sm">{t("dash.noUpcomingSessions")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My students */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("dash.myStudents")}</CardTitle>
                  <CardDescription>{t("dash.recentEnrollments")}</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/teacher/students">
                    {t("dash.viewAll")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {enrollments.map((enrollment) => {
                  const percent = progressFor(enrollment.student.id, enrollment.course.id);
                  return (
                    <div key={enrollment.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials(enrollment.student.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{enrollment.student.name}</span>
                          <span className="text-muted-foreground">{enrollment.course.name} · {percent}%</span>
                        </div>
                        <Progress value={percent} />
                      </div>
                    </div>
                  );
                })}

                {enrollments.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("dash.noStudentsEnrolled")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Assignments to grade */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{t("dash.assignmentsToGrade")}</CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/teacher/assignments">
                    {t("dash.all")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {gradingQueue.map((submission) => (
                  <div key={submission.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <FileClock className="size-3.5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-tight">{submission.assignment.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {submission.student.name} · {submission.assignment.course.name}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 rounded-full">
                      {t("dash.submitted")}
                    </Badge>
                  </div>
                ))}

                {gradingQueue.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-4 text-center text-muted-foreground">
                    <CheckCircle2 className="size-6" />
                    <span className="text-sm">{t("dash.allCaughtUpGrading")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{t("dash.availability")}</CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/teacher/availability">
                    {t("dash.manage")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {availability.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                    <span className="font-medium">
                      {slot.dayOfWeek !== null ? dayLabels[slot.dayOfWeek] : t("dash.oneOff")}
                    </span>
                    <span className="text-muted-foreground">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                ))}

                {availability.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("dash.noAvailabilitySet")}</p>
                )}
              </CardContent>
            </Card>

            {/* Verification status */}
            <Card className={`border-border/80 ${verification.className}`}>
              <CardContent className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-background/20">
                  <verification.icon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-sm">{currentUser.verificationStatus === "VERIFIED" ? t("dash.verifiedTeacher") : currentUser.verificationStatus === "REJECTED" ? t("dash.verificationRejected") : t("dash.verificationPending")}</span>
                  <span className="text-xs opacity-80">
                    {currentUser.isVolunteer ? t("dash.volunteerTeacher") : t("dash.paidTeacher")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
