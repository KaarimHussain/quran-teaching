import {
  TrendingUp,
  BookOpenText,
  Mic,
  Brain,
  ScrollText,
  Sunrise,
  Landmark,
  CheckCircle2,
} from "lucide-react";
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
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatDate } from "@/lib/format";

const subjectIcons: Record<string, typeof BookOpenText> = {
  NAZRA: BookOpenText,
  TAJWEED: Mic,
  HIFZ: Brain,
  TAFSEER: ScrollText,
};

const subjectLabels: Record<string, string> = {
  NAZRA: "Nazra Quran",
  TAJWEED: "Tajweed",
  HIFZ: "Hifz-ul-Quran",
  TAFSEER: "Tafseer",
};

const subjectColors: Record<string, string> = {
  NAZRA: "text-primary",
  TAJWEED: "text-accent-foreground",
  HIFZ: "text-chart-4",
  TAFSEER: "text-secondary-foreground",
};

const courseIcons: Record<string, typeof BookOpenText> = {
  "Nazra Quran": BookOpenText,
  Tajweed: Mic,
  "Hifz-ul-Quran": Brain,
  Tafseer: ScrollText,
  "Salah (Prayer Practice)": Sunrise,
  "Islamic Studies": Landmark,
};

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function StudentProgressPage() {
  const [user, t] = await Promise.all([
    requireCurrentUser(),
    getTranslations("pages.student"),
  ]);

  const [progressEntries, enrollments] = await Promise.all([
    prisma.progressEntry.findMany({
      where: { studentUserId: user.id },
      include: { course: true },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { studentUserId: user.id, status: "ACTIVE" },
      include: { course: true },
      orderBy: { enrolledAt: "asc" },
    }),
  ]);

  // Latest progress entry per subjectArea
  const latestBySubject = new Map<string, (typeof progressEntries)[0]>();
  for (const entry of progressEntries) {
    if (!latestBySubject.has(entry.subjectArea)) {
      latestBySubject.set(entry.subjectArea, entry);
    }
  }
  const subjectProgress = Array.from(latestBySubject.values());

  const overallPercent =
    subjectProgress.length > 0
      ? Math.round(
          subjectProgress.reduce(
            (sum, e) => sum + (e.percentComplete ?? 0),
            0
          ) / subjectProgress.length
        )
      : 0;

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("progress")}
      description={t("progressDesc")}
    >
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">
                  {enrollments.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("progressPage.activeCourses")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                <TrendingUp className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">
                  {overallPercent}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("progressPage.overallProgress")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-secondary/30 text-secondary-foreground">
                <BookOpenText className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">
                  {subjectProgress.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("progressPage.subjectsTracked")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4">
                <Brain className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">
                  {progressEntries.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("progressPage.progressUpdates")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Subject progress */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>{t("progressPage.progressBySubject")}</CardTitle>
                <CardDescription>
                  {t("progressPage.howFarAlong")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {subjectProgress.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("progressPage.noProgressEntries")}
                  </p>
                ) : (
                  subjectProgress.map((entry) => {
                    const SubjectIcon =
                      subjectIcons[entry.subjectArea] ?? BookOpenText;
                    const color =
                      subjectColors[entry.subjectArea] ?? "text-primary";
                    const label =
                      subjectLabels[entry.subjectArea] ?? entry.subjectArea;
                    return (
                      <div
                        key={entry.subjectArea}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium">
                            <SubjectIcon className={`size-4 ${color}`} />{" "}
                            {label}
                          </span>
                          <span className="text-muted-foreground">
                            {entry.percentComplete ?? 0}%
                          </span>
                        </div>
                        <Progress value={entry.percentComplete ?? 0} />
                        {entry.description && (
                          <p className="text-xs text-muted-foreground">
                            {entry.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Enrolled courses */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>{t("progressPage.enrolledCourses")}</CardTitle>
                <CardDescription>{t("progressPage.activeLearningPathways")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("progressPage.notEnrolledYet")}
                  </p>
                ) : (
                  enrollments.map((enrollment) => {
                    const CourseIcon =
                      courseIcons[enrollment.course.name] ?? BookOpenText;
                    return (
                      <div
                        key={enrollment.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <CourseIcon className="size-5" />
                        </span>
                        <div className="flex flex-1 flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {enrollment.course.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t("progressPage.enrolled")} {formatDate(enrollment.enrolledAt)}
                          </span>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          {levelLabel[enrollment.pathwayLevel] ??
                            enrollment.pathwayLevel}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Recent progress updates */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>{t("progressPage.recentUpdates")}</CardTitle>
                <CardDescription>{t("progressPage.latestFeedback")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {progressEntries.slice(0, 6).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("progressPage.noUpdates")}
                  </p>
                ) : (
                  progressEntries.slice(0, 6).map((entry) => {
                    const SubjectIcon =
                      subjectIcons[entry.subjectArea] ?? BookOpenText;
                    const color =
                      subjectColors[entry.subjectArea] ?? "text-primary";
                    return (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 rounded-lg border border-border p-3"
                      >
                        <span
                          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted`}
                        >
                          <SubjectIcon className={`size-4 ${color}`} />
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium">
                            {subjectLabels[entry.subjectArea] ??
                              entry.subjectArea}
                            {entry.percentComplete != null && (
                              <span className="ml-1 text-muted-foreground">
                                · {entry.percentComplete}%
                              </span>
                            )}
                          </span>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {entry.description}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(entry.recordedAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Encouragement */}
            <Card className="border-border/80 bg-primary text-primary-foreground">
              <CardContent className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <TrendingUp className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-sm">
                    {t("progressPage.percentComplete", { percent: overallPercent })}
                  </span>
                  <span className="text-xs text-primary-foreground/70">
                    {t("progressPage.keepGoing")}
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
