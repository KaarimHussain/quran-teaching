import Link from "next/link";
import {
  BookOpenText,
  Mic,
  Brain,
  ScrollText,
  Sunrise,
  Landmark,
  ArrowRight,
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
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { EnrollDialog } from "./enroll-dialog";
import { getTranslations } from "next-intl/server";

const courseIcons: Record<string, typeof BookOpenText> = {
  "Nazra Quran": BookOpenText,
  "Tajweed": Mic,
  "Hifz-ul-Quran": Brain,
  "Tafseer": ScrollText,
  "Salah (Prayer Practice)": Sunrise,
  "Islamic Studies": Landmark,
};

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function StudentCoursesPage() {
  const user = await requireCurrentUser();
  const t = await getTranslations("pages.student");

  const [enrollments, availableCourses, progressEntries] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentUserId: user.id },
      include: { course: true },
      orderBy: { enrolledAt: "asc" },
    }),
    prisma.course.findMany({
      where: {
        isActive: true,
        enrollments: { none: { studentUserId: user.id } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.progressEntry.findMany({
      where: { studentUserId: user.id },
      orderBy: { recordedAt: "desc" },
    }),
  ]);

  const latestProgressByCourse = new Map(
    progressEntries.map((p) => [p.courseId, p])
  );

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      language={user.preferredLanguage as "EN" | "UR" | "AR"}
      title={t("courses")}
      description={t("coursesDesc")}
    >
      <div className="flex flex-col gap-8">

        {/* Enrolled courses */}
        {enrollments.length > 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-heading text-xl text-primary">My Enrolled Courses</h2>
            {enrollments.map((enrollment) => {
              const Icon = courseIcons[enrollment.course.name] ?? BookOpenText;
              const latestProgress = latestProgressByCourse.get(enrollment.courseId);
              const percent = latestProgress?.percentComplete ?? 0;
              return (
                <Card key={enrollment.id} className="border-border/80">
                  <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </span>
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-lg">{enrollment.course.name}</CardTitle>
                          <Badge variant="outline" className="rounded-full">
                            {levelLabel[enrollment.pathwayLevel]}
                          </Badge>
                          <Badge variant={enrollment.status === "ACTIVE" ? "secondary" : "outline"} className="rounded-full">
                            {enrollment.status === "ACTIVE" ? "Active" : enrollment.status === "COMPLETED" ? "Completed" : "Withdrawn"}
                          </Badge>
                        </div>
                        {enrollment.course.description && (
                          <CardDescription className="text-xs">{enrollment.course.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                      <Link href="/student/schedule">
                        View Schedule <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {latestProgress
                            ? latestProgress.description ?? "Progress recorded"
                            : "No progress recorded yet"}
                        </span>
                        <span className="font-medium text-primary">{percent}%</span>
                      </div>
                      <Progress value={percent} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Explore more courses */}
        {availableCourses.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl text-primary">Explore More Courses</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/courses">
                  View Catalog <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableCourses.map((course) => {
                const Icon = courseIcons[course.name] ?? BookOpenText;
                return (
                  <Card key={course.id} className="flex flex-col border-border/80">
                    <CardHeader>
                      <span className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <CardTitle className="text-base">{course.name}</CardTitle>
                      {course.description && (
                        <CardDescription className="text-sm leading-relaxed">
                          {course.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <EnrollDialog courseId={course.id} courseName={course.name} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {enrollments.length === 0 && availableCourses.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <BookOpenText className="size-8" />
            <p className="text-sm">No courses available at the moment. Check back soon.</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
