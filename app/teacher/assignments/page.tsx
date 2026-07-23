import { ClipboardList, Calendar, CheckCircle2, FileClock, AlertCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { getTeacherCourseIds } from "@/lib/teacher";
import { CreateAssignmentForm } from "./create-assignment-form";
import { GradeForm } from "./grade-form";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const submissionMeta: Record<
  string,
  { label: string; variant: "secondary" | "outline" | "destructive"; icon: typeof CheckCircle2 }
> = {
  REVIEWED: { label: "Reviewed", variant: "secondary", icon: CheckCircle2 },
  SUBMITTED: { label: "Submitted", variant: "outline", icon: FileClock },
  NOT_SUBMITTED: { label: "Not Submitted", variant: "outline", icon: AlertCircle },
};

export default async function TeacherAssignmentsPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.teacher");
  const courseIds = await getTeacherCourseIds(currentUser.id);

  const [courses, assignments] = await Promise.all([
    prisma.course.findMany({
      where: { id: { in: courseIds } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.assignment.findMany({
      where: { teacherUserId: currentUser.id },
      orderBy: { dueDate: "desc" },
      include: {
        course: { select: { name: true } },
        submissions: { include: { student: { select: { id: true, name: true } } } },
      },
    }),
  ]);

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("assignments")}
      description={t("assignmentsDesc")}
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("assignmentsPage.createAssignment")}</CardTitle>
            <CardDescription>{t("assignmentsPage.createAssignmentDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("assignmentsPage.noCoursesYet")}
              </p>
            ) : (
              <CreateAssignmentForm courses={courses} />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-4" /> {t("assignmentsPage.yourAssignments")}
            </CardTitle>
            <CardDescription>
              {assignments.length === 0 ? t("assignmentsPage.noAssignmentsYet") : t("assignmentsPage.assignmentCount", { count: assignments.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {assignments.map((assignment) => {
              const total = assignment.submissions.length;
              const reviewed = assignment.submissions.filter((s) => s.status === "REVIEWED").length;
              const needsGrading = assignment.submissions.filter((s) => s.status === "SUBMITTED");

              return (
                <div key={assignment.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium leading-tight">{assignment.title}</span>
                      <span className="text-xs text-muted-foreground">{assignment.course.name}</span>
                      {assignment.description && (
                        <span className="text-xs text-muted-foreground">{assignment.description}</span>
                      )}
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" /> {t("assignmentsPage.due")} {formatDateTime(assignment.dueDate)}
                      </span>
                    </div>
                    {needsGrading.length > 0 && (
                      <Badge className="rounded-full">{t("assignmentsPage.toGrade", { count: needsGrading.length })}</Badge>
                    )}
                  </div>

                  {total > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("assignmentsPage.reviewed")}</span>
                        <span>{reviewed}/{total}</span>
                      </div>
                      <Progress value={(reviewed / total) * 100} />
                    </div>
                  )}

                  {total > 0 && (
                    <div className="flex flex-col gap-2 border-t border-border pt-3">
                      {assignment.submissions.map((submission) => {
                        const meta = submissionMeta[submission.status];
                        return (
                          <div key={submission.id} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2 text-sm">
                                <Avatar size="sm">
                                  <AvatarFallback>{initials(submission.student.name)}</AvatarFallback>
                                </Avatar>
                                {submission.student.name}
                              </span>
                              <div className="flex items-center gap-2">
                                {submission.grade && (
                                  <Badge variant="outline" className="rounded-full">{t("assignmentsPage.grade")}: {submission.grade}</Badge>
                                )}
                                <Badge variant={meta.variant} className="rounded-full">
                                  <meta.icon className="size-3" /> {submission.status === "REVIEWED" ? t("assignmentsPage.reviewedStatus") : submission.status === "SUBMITTED" ? t("assignmentsPage.submittedStatus") : t("assignmentsPage.notSubmittedStatus")}
                                </Badge>
                              </div>
                            </div>
                            {submission.status === "SUBMITTED" && <GradeForm submissionId={submission.id} />}
                            {submission.feedback && (
                              <p className="rounded-md bg-muted px-2.5 py-2 text-xs text-muted-foreground">
                                {submission.feedback}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {assignments.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("assignmentsPage.createFirstAssignment")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
