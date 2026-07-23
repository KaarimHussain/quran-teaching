import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Award,
  CheckCircle2,
  Clock,
  Video,
  TrendingUp,
  ArrowRight,
  FileClock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { roleLabel } from "@/lib/roles";
import { formatDateTime } from "@/lib/format";

export default async function StudentDashboardPage() {
  const user = await requireCurrentUser();
  const t = await getTranslations("pages.student");
  const firstName = user.name.split(" ")[0];

  const now = new Date();

  const [enrollments, participants, progressEntries, submissions, certCount, latestCert, attendances] =
    await Promise.all([
      // Active enrollments with course info
      prisma.enrollment.findMany({
        where: { studentUserId: user.id, status: "ACTIVE" },
        include: { course: true },
        orderBy: { enrolledAt: "desc" },
      }),
      // Upcoming sessions this student is a participant of
      prisma.classParticipant.findMany({
        where: {
          studentUserId: user.id,
          classSession: {
            status: { in: ["SCHEDULED", "LIVE"] },
            scheduledStart: { gte: now },
          },
        },
        include: {
          classSession: {
            include: {
              course: true,
              teacher: { select: { name: true } },
            },
          },
        },
        orderBy: { classSession: { scheduledStart: "asc" } },
        take: 3,
      }),
      // Latest progress entry per subject (most recent per course)
      prisma.progressEntry.findMany({
        where: { studentUserId: user.id },
        include: { course: true },
        orderBy: { recordedAt: "desc" },
      }),
      // Recent homework submissions
      prisma.submission.findMany({
        where: { studentUserId: user.id },
        include: { assignment: { include: { course: true } } },
        orderBy: { assignment: { dueDate: "desc" } },
        take: 5,
      }),
      // Certificate count
      prisma.certificate.count({ where: { studentUserId: user.id } }),
      // Latest certificate for teaser card
      prisma.certificate.findFirst({
        where: { studentUserId: user.id },
        include: { course: true },
        orderBy: { issuedAt: "desc" },
      }),
      // Attendance for rate calculation
      prisma.attendance.findMany({
        where: { studentUserId: user.id },
        select: { status: true },
      }),
    ]);

  // Attendance rate
  const totalAttendance = attendances.length;
  const presentCount = attendances.filter((a) => a.status !== "ABSENT").length;
  const attendanceRate =
    totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Latest progress per subjectArea (for the progress-by-subject panel)
  const subjectMap = new Map<string, number>();
  for (const entry of progressEntries) {
    if (!subjectMap.has(entry.subjectArea) && entry.percentComplete != null) {
      subjectMap.set(entry.subjectArea, entry.percentComplete);
    }
  }
  const progressBySubject = Array.from(subjectMap.entries()).map(([subject, percent]) => ({
    subject: subject.charAt(0) + subject.slice(1).toLowerCase(),
    percent,
  }));

  // Enrollment progress: latest percentComplete per course from progressEntries
  const courseProgressMap = new Map<string, number>();
  for (const entry of progressEntries) {
    if (!courseProgressMap.has(entry.courseId) && entry.percentComplete != null) {
      courseProgressMap.set(entry.courseId, entry.percentComplete);
    }
  }

  const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    REVIEWED: "secondary",
    SUBMITTED: "outline",
    NOT_SUBMITTED: "outline",
  };
  const statusLabel: Record<string, string> = {
    REVIEWED: t("dash.reviewed"),
    SUBMITTED: t("dash.submitted"),
    NOT_SUBMITTED: t("dash.notSubmitted"),
  };

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("dashboard")}
      description={t("dashboardDesc", { name: firstName })}
    >
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: t("dash.enrolledCourses"),
              value: enrollments.length.toString(),
              icon: BookOpen,
              color: "bg-primary/10 text-primary",
            },
            {
              label: t("dash.upcomingClasses"),
              value: participants.length.toString(),
              icon: CalendarDays,
              color: "bg-accent/20 text-accent-foreground",
            },
            {
              label: t("dash.attendanceRate"),
              value: totalAttendance > 0 ? `${attendanceRate}%` : "—",
              icon: TrendingUp,
              color: "bg-secondary/30 text-secondary-foreground",
            },
            {
              label: t("dash.certificatesEarned"),
              value: certCount.toString(),
              icon: Award,
              color: "bg-chart-4/10 text-chart-4",
            },
          ].map((stat) => (
            <Card key={stat.label} size="sm" className="border-border/80">
              <CardContent className="flex items-center gap-3">
                <span
                  className={`flex size-10 items-center justify-center rounded-xl ${stat.color}`}
                  aria-hidden="true"
                >
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
                  <Link href="/student/schedule">
                    {t("dash.viewSchedule")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {participants.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                    <CalendarDays className="size-6" />
                    <span className="text-sm">{t("dash.noUpcomingSessions")}</span>
                  </div>
                ) : (
                  participants.map(({ classSession }) => (
                    <div
                      key={classSession.id}
                      className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between hover-row"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
                          aria-hidden="true"
                        >
                          <Video className="size-5" />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium">{classSession.course.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {classSession.teacher.name}
                          </span>
                          <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3.5" aria-hidden="true" />
                            {formatDateTime(classSession.scheduledStart)}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-fit rounded-full">
                        {classSession.type === "ONE_TO_ONE" ? t("dash.oneToOne") : t("dash.group")}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* My courses */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("dash.myCourses")}</CardTitle>
                  <CardDescription>{t("dash.continueWhereYouLeft")}</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/student/courses">
                    {t("dash.viewAll")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {enrollments.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                    <BookOpen className="size-6" />
                    <span className="text-sm">{t("dash.notEnrolledYet")}</span>
                    <Button asChild size="sm" variant="outline" className="mt-1 rounded-full">
                      <Link href="/student/courses">{t("dash.browseCourses")}</Link>
                    </Button>
                  </div>
                ) : (
                  enrollments.map((enrollment) => {
                    const progress = courseProgressMap.get(enrollment.courseId) ?? 0;
                    return (
                      <div key={enrollment.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{enrollment.course.name}</span>
                          <span className="text-muted-foreground">
                            {enrollment.pathwayLevel.charAt(0) +
                              enrollment.pathwayLevel.slice(1).toLowerCase()}{" "}
                            · {progress}%
                          </span>
                        </div>
                        <Progress value={progress} aria-label={`${enrollment.course.name} progress`} />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Progress by subject */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>{t("dash.progressBySubject")}</CardTitle>
                <CardDescription>{t("dash.acrossAllCourses")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {progressBySubject.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("dash.noProgressYet")}</p>
                ) : (
                  progressBySubject.map((item) => (
                    <div key={item.subject} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.subject}</span>
                        <span className="text-muted-foreground">{item.percent}%</span>
                      </div>
                      <Progress value={item.percent} aria-label={`${item.subject} progress`} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Homework */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{t("dash.homeworkStatus")}</CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/student/assignments">
                    {t("dash.all")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {submissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("dash.noHomeworkYet")}</p>
                ) : (
                  submissions.map((sub) => (
                    <div key={sub.id} className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span
                          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                          aria-hidden="true"
                        >
                          {sub.status === "REVIEWED" ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : (
                            <FileClock className="size-3.5" />
                          )}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-tight">
                            {sub.assignment.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {sub.assignment.course.name}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={statusVariant[sub.status]}
                        className="shrink-0 rounded-full"
                      >
                        {statusLabel[sub.status]}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Certificate teaser or empty state */}
            {latestCert ? (
              <Card className="border-border/80 bg-primary text-primary-foreground">
                <CardContent className="flex items-center gap-3">
                  <span
                    className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/10"
                    aria-hidden="true"
                  >
                    <Award className="size-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-heading text-sm">
                      {latestCert.course.name} —{" "}
                      {latestCert.pathwayLevel.charAt(0) +
                        latestCert.pathwayLevel.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-primary-foreground/70">
                      {t("dash.certificateEarned")}
                    </span>
                  </div>
                  <Button asChild size="sm" variant="secondary" className="ml-auto rounded-full">
                    <Link href="/student/certificates">{t("dash.view")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/80 border-dashed">
                <CardContent className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                  <Award className="size-8" aria-hidden="true" />
                  <span className="text-sm font-medium">{t("dash.noCertificatesYet")}</span>
                  <span className="text-xs">
                    {t("dash.completeCourseForCert")}
                  </span>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
