import { BookOpen, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser, verifySession } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { teacherCoursesWhere } from "@/lib/teacher";
import { CreatePlanForm } from "./create-plan-form";
import { AddStepForm } from "./add-step-form";
import { DeletePlanButton, DeleteStepButton } from "./delete-buttons";

const LANG_LABEL: Record<string, string> = { EN: "English", UR: "Urdu", AR: "Arabic" };

export default async function TeacherLessonPlansPage() {
  // Courses are inlined as a relation filter and the user lookup runs in the
  // same batch (keyed off the JWT), instead of two round-trips up front.
  const { userId: teacherId } = await verifySession();
  const teacherCourses = teacherCoursesWhere(teacherId);

  const [user, courses, plans] = await Promise.all([
    requireCurrentUser(),
    prisma.course.findMany({
      where: { ...teacherCourses, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.lessonPlan.findMany({
      where: { teacherUserId: teacherId },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { name: true } },
        steps: { orderBy: { stepOrder: "asc" } },
      },
    }),
  ]);
  if (user.role !== "TEACHER") throw new Error("Forbidden");

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Lesson Plan Templates"
      description="Create structured lesson plans with timed steps to guide your teaching sessions."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>New Lesson Plan</CardTitle>
            <CardDescription>Build a reusable plan for a course.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePlanForm courses={courses} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {plans.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No lesson plans yet. Create your first one above.
            </p>
          )}
          {plans.map((plan) => {
            const totalMins = plan.steps.reduce((s, st) => s + st.durationMins, 0);
            return (
              <Card key={plan.id} className="border-border/80">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-base">{plan.title}</CardTitle>
                      <CardDescription>{plan.course.name}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{LANG_LABEL[plan.language]}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {plan.durationMins}m total
                      </div>
                      <DeletePlanButton planId={plan.id} />
                    </div>
                  </div>
                  {plan.objective && (
                    <p className="mt-1 text-xs text-muted-foreground italic">{plan.objective}</p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {plan.steps.length > 0 && (
                    <ol className="flex flex-col gap-1.5">
                      {plan.steps.map((step) => (
                        <li
                          key={step.id}
                          className="flex items-start justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">
                              {step.stepOrder}. {step.title}
                            </span>
                            {step.description && (
                              <span className="text-xs text-muted-foreground">
                                {step.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {step.durationMins}m
                            </span>
                            <DeleteStepButton stepId={step.id} />
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                  {plan.steps.length > 0 && totalMins !== plan.durationMins && (
                    <p className="text-xs text-amber-600">
                      Note: steps total {totalMins}m vs plan duration {plan.durationMins}m
                    </p>
                  )}
                  <AddStepForm lessonPlanId={plan.id} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
