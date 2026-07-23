import { BookOpenCheck, BookOpen, Users, Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
import { toggleCourseActive } from "./actions";
import { CreateCourseForm } from "./create-course-form";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function AdminCoursesPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");

  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      _count: { select: { enrollments: true } },
    },
  });

  const activeCount = courses.filter((course) => course.isActive).length;
  const totalEnrollments = courses.reduce((sum, course) => sum + course._count.enrollments, 0);
  const maxEnrollments = Math.max(...courses.map((course) => course._count.enrollments), 1);

  const stats = [
    { label: "Total Courses", value: courses.length, icon: Layers, color: "bg-primary/10 text-primary" },
    { label: "Active Courses", value: activeCount, icon: BookOpenCheck, color: "bg-chart-4/10 text-chart-4" },
    { label: "Inactive", value: courses.length - activeCount, icon: BookOpen, color: "bg-muted text-muted-foreground" },
    { label: "Total Enrollments", value: totalEnrollments, icon: Users, color: "bg-accent/20 text-accent-foreground" },
  ];

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("courses")}
      description={t("coursesDesc")}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} size="sm" className="border-border/80">
              <CardContent className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-xl text-primary">{stat.value.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Add Course</CardTitle>
            <CardDescription>Create a new course in the catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCourseForm />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Course Catalog</CardTitle>
            <CardDescription>{courses.length} courses</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {courses.map((course) => (
              <div key={course.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 overflow-hidden">
                  <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${course.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <BookOpenCheck className="size-4" />
                  </span>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium leading-tight">{course.name}</span>
                    {course.description && (
                      <span className="truncate text-xs text-muted-foreground">{course.description}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:w-64">
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{course._count.enrollments.toLocaleString()} enrolled</span>
                      <Badge variant={course.isActive ? "secondary" : "outline"} className="rounded-full">
                        {course.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <Progress value={(course._count.enrollments / maxEnrollments) * 100} />
                  </div>
                  <form action={toggleCourseActive}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <SubmitButton size="sm" variant="outline" className="rounded-full" pendingLabel="Saving…">
                      {course.isActive ? "Deactivate" : "Activate"}
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <BookOpenCheck className="size-6" />
                <span className="text-sm">No courses yet — add your first one above.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
