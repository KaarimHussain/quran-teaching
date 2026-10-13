import { ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { CreateAssessmentForm } from "./create-assessment-form";
import { RecordResultForm } from "./record-result-form";

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function TeacherAssessmentsPage() {
  // Courses are inlined as a relation filter and the user lookup runs in the
  // same batch (keyed off the JWT), instead of two round-trips up front.
  const { userId: teacherId } = await verifySession();
  const teacherCourses = teacherCoursesWhere(teacherId);

  const [user, courses, assessments, enrollments] = await Promise.all([
    requireCurrentUser(),
    prisma.course.findMany({
      where: teacherCourses,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.assessment.findMany({
      where: { teacherUserId: teacherId },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { name: true } },
        results: {
          include: { student: { select: { id: true, name: true } } },
          orderBy: { gradedAt: "desc" },
        },
      },
    }),
    prisma.enrollment.findMany({
      where: { course: teacherCourses, status: "ACTIVE" },
      select: { student: { select: { id: true, name: true } } },
      distinct: ["studentUserId"],
    }),
  ]);
  if (user.role !== "TEACHER") throw new Error("Forbidden");

  const allStudents = Array.from(
    new Map(enrollments.map((e) => [e.student.id, e.student])).values()
  );

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Assessments"
      description="Create level-up assessments and record student results."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Create Assessment</CardTitle>
            <CardDescription>Define a test for a specific course and pathway level.</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
            ) : (
              <CreateAssessmentForm courses={courses} />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-4" /> Your Assessments
            </CardTitle>
            <CardDescription>
              {assessments.length === 0
                ? "No assessments created yet."
                : `${assessments.length} assessment${assessments.length === 1 ? "" : "s"} created.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{assessment.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {assessment.course.name} · {levelLabel[assessment.pathwayLevel]} · Pass mark: {assessment.passMark}%
                    </span>
                    {assessment.description && (
                      <span className="text-sm text-muted-foreground">{assessment.description}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {assessment.results.length} result{assessment.results.length === 1 ? "" : "s"}
                  </Badge>
                </div>

                {assessment.results.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-border pt-2">
                    {assessment.results.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-sm">
                        <span>{r.student.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{r.score}%</span>
                          {r.passed ? (
                            <Badge variant="secondary" className="rounded-full gap-1">
                              <CheckCircle2 className="size-3" /> Pass
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full gap-1 text-destructive border-destructive/40">
                              <XCircle className="size-3" /> Fail
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <RecordResultForm assessmentId={assessment.id} students={allStudents} />
              </div>
            ))}

            {assessments.length === 0 && (
              <p className="text-sm text-muted-foreground">Create your first assessment above.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
