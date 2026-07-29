import { Brain, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getTeacherCourseIds } from "@/lib/teacher";
import { CreateHifzScheduleForm } from "./create-schedule-form";
import { MarkReviewForm } from "./mark-review-form";

const qualityLabels = ["0 – Blackout", "1 – Wrong", "2 – Wrong (familiar)", "3 – Correct (hard)", "4 – Correct", "5 – Perfect"];

export default async function TeacherHifzPage() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") throw new Error("Forbidden");

  const courseIds = await getTeacherCourseIds(user.id);

  const [courses, schedules, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.hifzReviewSchedule.findMany({
      where: { createdByUserId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { name: true } },
        sessions: { orderBy: { dueDate: "asc" } },
      },
    }),
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds }, status: "ACTIVE" },
      select: { student: { select: { id: true, name: true } } },
      distinct: ["studentUserId"],
    }),
  ]);

  const students = Array.from(
    new Map(enrollments.map((e) => [e.student.id, e.student])).values()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Hifz Review Cycles"
      description="Schedule and track spaced-repetition review cycles for Hifz students."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>New Review Schedule</CardTitle>
            <CardDescription>Assign a Hifz revision cycle to a student. The system will auto-schedule follow-up reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateHifzScheduleForm courses={courses} students={students} />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-4" /> Active Schedules
            </CardTitle>
            <CardDescription>
              {schedules.length === 0 ? "No schedules yet." : `${schedules.length} schedule${schedules.length === 1 ? "" : "s"} active.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {schedules.map((schedule) => {
              const upcomingSession = schedule.sessions.find((s) => s.status === "SCHEDULED");
              const completedCount = schedule.sessions.filter((s) => s.status === "COMPLETED").length;
              const isDueToday = upcomingSession
                ? new Date(upcomingSession.dueDate) <= today
                : false;

              return (
                <div key={schedule.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {schedule.surah} — Ayah {schedule.ayahFrom}–{schedule.ayahTo}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {schedule.student.name} · {schedule.course.name} · {completedCount} review{completedCount === 1 ? "" : "s"} completed
                      </span>
                    </div>
                    {upcomingSession && (
                      <Badge
                        variant={isDueToday ? "default" : "outline"}
                        className="rounded-full gap-1 shrink-0"
                      >
                        {isDueToday ? (
                          <><AlertCircle className="size-3" /> Due today</>
                        ) : (
                          <><Clock className="size-3" /> Due {new Date(upcomingSession.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</>
                        )}
                      </Badge>
                    )}
                  </div>

                  {upcomingSession && isDueToday && (
                    <MarkReviewForm sessionId={upcomingSession.id} />
                  )}

                  {!upcomingSession && (
                    <p className="text-xs text-muted-foreground italic">All reviews completed for this schedule.</p>
                  )}
                </div>
              );
            })}

            {schedules.length === 0 && (
              <p className="text-sm text-muted-foreground">No Hifz schedules created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
