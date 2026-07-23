import { ClipboardList, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
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
import type { SubmissionStatus } from "@/lib/generated/prisma/client";

const statusLabel: Record<SubmissionStatus, string> = {
  NOT_SUBMITTED: "Not Submitted",
  SUBMITTED: "Submitted",
  REVIEWED: "Reviewed",
};

const statusVariant: Record<SubmissionStatus, "secondary" | "outline"> = {
  REVIEWED: "secondary",
  SUBMITTED: "outline",
  NOT_SUBMITTED: "outline",
};

export default async function ParentHomeworkPage() {
  const user = await requireCurrentUser();
  const t = await getTranslations("pages.parent");

  const links = await prisma.parentStudentLink.findMany({
    where: { parentUserId: user.id },
    include: {
      student: {
        include: {
          submissions: {
            include: {
              assignment: { include: { course: true } },
            },
            orderBy: { assignment: { dueDate: "asc" } },
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
      title={t("homework")}
      description={t("homeworkDesc")}
    >
      {links.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <ClipboardList className="size-8" />
          <p className="text-sm">{t("homeworkPage.noChildrenLinked")}</p>
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

          {links.map(({ student }) => {
            const submissions = student.submissions;
            const reviewedCount = submissions.filter((s) => s.status === "REVIEWED").length;
            const submittedCount = submissions.filter((s) => s.status === "SUBMITTED").length;
            const pendingCount = submissions.filter((s) => s.status === "NOT_SUBMITTED").length;

            return (
              <TabsContent key={student.id} value={student.id} className="mt-4 flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: t("homeworkPage.reviewed"), value: reviewedCount, cls: "text-chart-4" },
                    { label: t("homeworkPage.submitted"), value: submittedCount, cls: "text-primary" },
                    { label: t("homeworkPage.pending"), value: pendingCount, cls: "text-destructive" },
                  ].map((stat) => (
                    <Card key={stat.label} size="sm" className="border-border/80">
                      <CardContent className="flex flex-col gap-1">
                        <span className={`font-heading text-xl ${stat.cls}`}>{stat.value}</span>
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-border/80">
                  <CardHeader>
                    <CardTitle>{t("homeworkPage.allAssignments")}</CardTitle>
                    <CardDescription>{t("homeworkPage.assignmentsCount", { count: submissions.length })}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {submissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("homeworkPage.noAssignments")}</p>
                    ) : (
                      submissions.map((sub) => (
                        <div key={sub.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{sub.assignment.title}</span>
                            <span className="text-xs text-muted-foreground">{sub.assignment.course.name}</span>
                            {sub.assignment.dueDate && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="size-3" /> {t("homeworkPage.due")} {formatDate(sub.assignment.dueDate)}
                              </span>
                            )}
                            {sub.grade && (
                              <span className="text-xs font-medium text-primary">{t("homeworkPage.grade")}: {sub.grade}</span>
                            )}
                          </div>
                          <Badge variant={statusVariant[sub.status]} className="shrink-0 rounded-full">
                            {sub.status === "NOT_SUBMITTED" ? t("homeworkPage.notSubmitted") : sub.status === "SUBMITTED" ? t("homeworkPage.submitted") : t("homeworkPage.reviewed")}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </DashboardShell>
  );
}
