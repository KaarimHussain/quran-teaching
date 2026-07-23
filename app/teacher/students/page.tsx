import { Users, BookOpenText } from "lucide-react";
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
import { getTeacherCourseIds } from "@/lib/teacher";
import { ProgressForm } from "./progress-form";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const pathwayLevelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const subjectAreaLabel: Record<string, string> = {
  NAZRA: "Nazra",
  HIFZ: "Hifz",
  TAJWEED: "Tajweed",
  TAFSEER: "Tafseer",
};

export default async function TeacherStudentsPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.teacher");
  const courseIds = await getTeacherCourseIds(currentUser.id);

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    orderBy: [{ course: { name: "asc" } }, { student: { name: "asc" } }],
    include: {
      student: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, name: true } },
    },
  });

  const progressEntries = enrollments.length
    ? await prisma.progressEntry.findMany({
        where: {
          studentUserId: { in: enrollments.map((e) => e.student.id) },
          courseId: { in: courseIds },
        },
        orderBy: { recordedAt: "desc" },
      })
    : [];

  const latestProgressFor = (studentId: string, courseId: string) => {
    const entries = progressEntries.filter((p) => p.studentUserId === studentId && p.courseId === courseId);
    const bySubject = new Map<string, (typeof entries)[number]>();
    for (const entry of entries) {
      if (!bySubject.has(entry.subjectArea)) bySubject.set(entry.subjectArea, entry);
    }
    return Array.from(bySubject.values());
  };

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("students")}
      description={t("studentsDesc")}
    >
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4" /> Student Roster
          </CardTitle>
          <CardDescription>
            {enrollments.length === 0
              ? "No students enrolled in your courses yet."
              : `${enrollments.length} enrollment${enrollments.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {enrollments.map((enrollment) => {
            const progress = latestProgressFor(enrollment.student.id, enrollment.course.id);
            return (
              <div key={enrollment.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{initials(enrollment.student.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium leading-tight">{enrollment.student.name}</span>
                    <span className="text-xs text-muted-foreground">{enrollment.student.email}</span>
                  </div>
                  <Badge variant="outline" className="ml-auto flex items-center gap-1 rounded-full">
                    <BookOpenText className="size-3" /> {enrollment.course.name}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {pathwayLevelLabel[enrollment.pathwayLevel]}
                  </Badge>
                </div>

                {progress.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {progress.map((entry) => (
                      <div key={entry.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{subjectAreaLabel[entry.subjectArea]}</span>
                          <span className="text-muted-foreground">{entry.percentComplete ?? 0}%</span>
                        </div>
                        <Progress value={entry.percentComplete ?? 0} />
                        <span className="text-xs text-muted-foreground">{entry.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                <ProgressForm studentUserId={enrollment.student.id} courseId={enrollment.course.id} />
              </div>
            );
          })}

          {enrollments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Once you're assigned class sessions for a course, enrolled students will appear here.
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
