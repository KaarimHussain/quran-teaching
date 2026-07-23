import { TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatDate } from "@/lib/format";

const subjectLabel: Record<string, string> = {
  NAZRA: "Nazra",
  HIFZ: "Hifz",
  TAJWEED: "Tajweed",
  TAFSEER: "Tafseer",
};

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function ParentProgressPage() {
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
            include: { course: true },
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
      title={t("progress")}
      description={t("progressDesc")}
    >
      {links.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <TrendingUp className="size-8" />
          <p className="text-sm">{t("progressPage.noChildrenLinked")}</p>
        </div>
      ) : (
        <Tabs defaultValue={links[0].studentUserId}>
          <TabsList>
            {links.map(({ student }) => (
              <TabsTrigger key={student.id} value={student.id}>
                {student.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {links.map(({ student }) => (
            <TabsContent key={student.id} value={student.id} className="mt-4 flex flex-col gap-4">
              {student.enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("progressPage.noActiveEnrollments")}</p>
              ) : (
                student.enrollments.map((enrollment) => {
                  const courseProgress = student.progressEntries.filter(
                    (p) => p.courseId === enrollment.courseId
                  );
                  return (
                    <Card key={enrollment.id} className="border-border/80">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{enrollment.course.name}</CardTitle>
                          <Badge variant="outline" className="rounded-full">
                            {levelLabel[enrollment.pathwayLevel]}
                          </Badge>
                        </div>
                        <CardDescription>{t("progressPage.progressEntries", { count: courseProgress.length })}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        {courseProgress.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{t("progressPage.noProgressRecorded")}</p>
                        ) : (
                          courseProgress.map((entry) => (
                            <div key={entry.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="rounded-full">
                                    {subjectLabel[entry.subjectArea]}
                                  </Badge>
                                  {entry.level && (
                                    <span className="text-xs text-muted-foreground">{entry.level}</span>
                                  )}
                                </div>
                                <span className="text-sm font-medium text-primary">{entry.percentComplete ?? 0}%</span>
                              </div>
                              <Progress value={entry.percentComplete ?? 0} className="h-1.5" />
                              {entry.description && (
                                <p className="text-xs text-muted-foreground">{entry.description}</p>
                              )}
                              <span className="text-xs text-muted-foreground">{formatDate(entry.recordedAt)}</span>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </DashboardShell>
  );
}
