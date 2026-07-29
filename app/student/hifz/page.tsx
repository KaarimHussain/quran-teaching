import { Brain, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

export default async function StudentHifzPage() {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  const schedules = await prisma.hifzReviewSchedule.findMany({
    where: { studentUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { name: true } },
      sessions: { orderBy: { dueDate: "asc" } },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueToday = schedules.filter((s) => {
    const next = s.sessions.find((r) => r.status === "SCHEDULED");
    return next && new Date(next.dueDate) <= today;
  });

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Hifz Review Cycles"
      description="Your personalised Quran memorisation review schedule."
    >
      <div className="flex flex-col gap-6">
        {dueToday.length > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">
              {dueToday.length} review{dueToday.length === 1 ? "" : "s"} due today — your teacher will mark them in your next class.
            </p>
          </div>
        )}

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-4" /> My Review Schedules
            </CardTitle>
            <CardDescription>
              {schedules.length === 0
                ? "No Hifz schedules assigned yet."
                : `${schedules.length} schedule${schedules.length === 1 ? "" : "s"} assigned.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {schedules.map((schedule) => {
              const total = schedule.sessions.length;
              const completed = schedule.sessions.filter((s) => s.status === "COMPLETED").length;
              const next = schedule.sessions.find((s) => s.status === "SCHEDULED");
              const isDue = next && new Date(next.dueDate) <= today;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div key={schedule.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {schedule.surah} · Ayah {schedule.ayahFrom}–{schedule.ayahTo}
                      </span>
                      <span className="text-xs text-muted-foreground">{schedule.course.name}</span>
                    </div>
                    {next ? (
                      <Badge variant={isDue ? "default" : "outline"} className="rounded-full gap-1 shrink-0">
                        {isDue ? (
                          <><AlertCircle className="size-3" /> Due today</>
                        ) : (
                          <><Clock className="size-3" /> Next: {new Date(next.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</>
                        )}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full gap-1">
                        <CheckCircle2 className="size-3" /> Complete
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{completed} of {total} reviews completed</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} />
                  </div>
                </div>
              );
            })}

            {schedules.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Your teacher will assign Hifz review schedules here once you begin memorisation.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
