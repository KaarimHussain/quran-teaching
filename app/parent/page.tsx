import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  Video,
  Clock,
  ArrowRight,
  MessagesSquare,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatDate } from "@/lib/format";

const submissionStatusLabel: Record<string, string> = {
  NOT_SUBMITTED: "Not Submitted",
  SUBMITTED: "Submitted",
  REVIEWED: "Reviewed",
};

const submissionStatusVariant: Record<string, "secondary" | "outline"> = {
  REVIEWED: "secondary",
  SUBMITTED: "outline",
  NOT_SUBMITTED: "outline",
};

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function ParentDashboardPage() {
  const user = await requireCurrentUser();
  const t = await getTranslations("pages.parent");

  const linkedStudents = await prisma.parentStudentLink.findMany({
    where: { parentUserId: user.id },
    include: {
      student: {
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: { course: true },
          },
          classParticipations: {
            include: {
              classSession: { include: { course: true } },
            },
            where: {
              classSession: {
                status: "SCHEDULED",
                scheduledStart: { gte: new Date() },
              },
            },
          },
          submissions: {
            include: { assignment: { include: { course: true } } },
            orderBy: { assignment: { dueDate: "asc" } },
            take: 5,
          },
          progressEntries: {
            orderBy: { recordedAt: "desc" },
          },
        },
      },
    },
  });

  if (linkedStudents.length === 0) {
    return (
      <DashboardShell
        role="parent"
        roleLabel={roleLabel[user.role]}
        userName={user.name}
        title={t("dashboard")}
        description={t("dashboardDesc")}
      >
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Users className="size-8" />
          <p className="text-sm">{t("dash.noChildrenLinked")}</p>
          <p className="text-xs">{t("dash.contactAdmin")}</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="parent"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("dashboard")}
      description={t("dashboardDesc")}
    >
      <div className="flex flex-col gap-6">
        <Tabs defaultValue={linkedStudents[0].studentUserId}>
          <TabsList>
            {linkedStudents.map(({ student }) => (
              <TabsTrigger key={student.id} value={student.id}>
                {student.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {linkedStudents.map(({ student }) => {
            const nextParticipation = [...student.classParticipations]
              .sort((a, b) => a.classSession.scheduledStart.getTime() - b.classSession.scheduledStart.getTime())[0];
            const nextClass = nextParticipation?.classSession;
            const latestProgressByCourse = new Map(student.progressEntries.map((p) => [p.courseId, p]));

            return (
              <TabsContent key={student.id} value={student.id} className="mt-4">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <Card size="sm" className="border-border/80">
                      <CardContent className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                          <CalendarCheck className="size-5" />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-heading text-xl text-primary">{student.enrollments.length}</span>
                          <span className="text-xs text-muted-foreground">{t("dash.activeCourses")}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card size="sm" className="border-border/80">
                      <CardContent className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/30 text-secondary-foreground">
                          <TrendingUp className="size-5" />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-heading text-xl text-primary">{student.submissions.length}</span>
                          <span className="text-xs text-muted-foreground">{t("dash.assignments")}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card size="sm" className="border-border/80">
                      <CardContent className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-chart-4/10 text-chart-4">
                          <ClipboardList className="size-5" />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-heading text-xl text-primary">
                            {student.submissions.filter((s) => s.status === "REVIEWED").length}
                          </span>
                          <span className="text-xs text-muted-foreground">{t("dash.reviewed")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-2">
                      <Card className="border-border/80">
                        <CardHeader>
                          <CardTitle>{t("dash.nextClass")}</CardTitle>
                          <CardDescription>{t("dash.studentUpcomingSession", { name: student.name })}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {nextClass ? (
                            <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                                  <Video className="size-5" />
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-medium">{nextClass.course.name}</span>
                                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="size-3.5" /> {formatDate(nextClass.scheduledStart)}
                                  </span>
                                </div>
                              </div>
                              <Button asChild variant="secondary" className="w-fit rounded-full">
                                <Link href="/parent/attendance">{t("dash.viewAttendance")}</Link>
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">{t("dash.noUpcomingClasses")}</p>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-border/80">
                        <CardHeader className="flex-row items-center justify-between">
                          <div>
                            <CardTitle>{t("dash.courseProgress")}</CardTitle>
                            <CardDescription>{t("dash.enrolledCoursesAndCompletion")}</CardDescription>
                          </div>
                          <Button asChild variant="ghost" size="sm" className="rounded-full">
                            <Link href="/parent/progress">
                              {t("dash.details")} <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                          {student.enrollments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("dash.noActiveEnrollments")}</p>
                          ) : (
                            student.enrollments.map((enrollment) => {
                              const latest = latestProgressByCourse.get(enrollment.courseId);
                              const percent = latest?.percentComplete ?? 0;
                              return (
                                <div key={enrollment.id} className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{enrollment.course.name}</span>
                                    <span className="text-muted-foreground">
                                      {levelLabel[enrollment.pathwayLevel]} · {percent}%
                                    </span>
                                  </div>
                                  <Progress value={percent} />
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex flex-col gap-6">
                      <Card className="border-border/80">
                        <CardHeader className="flex-row items-center justify-between">
                          <CardTitle>{t("dash.homework")}</CardTitle>
                          <Button asChild variant="ghost" size="sm" className="rounded-full">
                            <Link href="/parent/homework">
                              {t("dash.all")} <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                          {student.submissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("dash.noAssignments")}</p>
                          ) : (
                            student.submissions.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium leading-tight line-clamp-1">
                                  {sub.assignment.title}
                                </span>
                                <Badge
                                  variant={submissionStatusVariant[sub.status]}
                                  className="shrink-0 rounded-full"
                                >
                                  {sub.status === "NOT_SUBMITTED" ? t("dash.notSubmitted") : sub.status === "SUBMITTED" ? t("dash.submittedStatus") : t("dash.reviewedStatus")}
                                </Badge>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-border/80">
                        <CardHeader className="flex-row items-center justify-between">
                          <CardTitle>{t("dash.messages")}</CardTitle>
                          <Button asChild variant="ghost" size="sm" className="rounded-full">
                            <Link href="/parent/messages">
                              {t("dash.open")} <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <Button asChild variant="secondary" className="w-full rounded-full">
                            <Link href="/parent/messages">
                              <MessagesSquare className="size-4" /> {t("dash.messageTeacher")}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </DashboardShell>
  );
}
