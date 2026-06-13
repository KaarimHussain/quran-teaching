import { BookOpenCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default async function AdminCoursesPage() {
  const currentUser = await requireCurrentUser();

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

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title="Courses"
      description="Manage the course catalog and enrollment status."
    >
      <div className="flex flex-col gap-6">
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
          <CardContent className="flex flex-col gap-2">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium leading-tight">{course.name}</span>
                  {course.description && (
                    <span className="truncate text-xs text-muted-foreground">{course.description}</span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {course._count.enrollments.toLocaleString()} enrolled
                  </span>
                  <Badge variant={course.isActive ? "secondary" : "outline"} className="rounded-full">
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <form action={toggleCourseActive}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <Button type="submit" size="sm" variant="outline" className="rounded-full">
                      {course.isActive ? "Deactivate" : "Activate"}
                    </Button>
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
