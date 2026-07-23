import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function ParentChildrenPage() {
  const user = await requireCurrentUser();
  const t = await getTranslations("pages.parent");

  const links = await prisma.parentStudentLink.findMany({
    where: { parentUserId: user.id },
    include: {
      student: {
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: { course: true },
          },
          progressEntries: {
            orderBy: { recordedAt: "desc" },
          },
        },
      },
    },
  });

  return (
    <DashboardShell
      role="parent"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("children")}
      description={t("childrenDesc")}
    >
      {links.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Users className="size-8" />
          <p className="text-sm">{t("childrenPage.noChildrenLinked")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(({ student }) => {
            const latestProgressByCourse = new Map(student.progressEntries.map((p) => [p.courseId, p]));
            return (
              <Card key={student.id} className="flex flex-col border-border/80">
                <CardHeader className="flex-row items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">{initials(student.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <CardTitle className="text-base">{student.name}</CardTitle>
                    <CardDescription className="text-xs">{student.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="size-4" />
                    <span>{t("childrenPage.activeCourses", { count: student.enrollments.length })}</span>
                  </div>
                  {student.enrollments.map((enrollment) => {
                    const pct = latestProgressByCourse.get(enrollment.courseId)?.percentComplete ?? 0;
                    return (
                      <div key={enrollment.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{enrollment.course.name}</span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="rounded-full text-[10px]">
                              {levelLabel[enrollment.pathwayLevel]}
                            </Badge>
                            <span className="text-muted-foreground">{pct}%</span>
                          </div>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                  <Button asChild variant="ghost" size="sm" className="mt-auto rounded-full">
                    <Link href="/parent/progress">
                      {t("childrenPage.viewProgress")} <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
