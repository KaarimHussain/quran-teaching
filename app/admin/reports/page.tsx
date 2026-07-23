import {
  BarChart3,
  GraduationCap,
  ClipboardCheck,
  Award,
  BookOpenCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EnrollmentChart } from "@/components/charts/enrollment-chart";
import { DistributionPieChart } from "@/components/charts/distribution-pie-chart";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const enrollmentStatusLabel: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  WITHDRAWN: "Withdrawn",
};

const pathwayLevelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const attendanceStatusLabel: Record<string, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
};

const classStatusLabel: Record<string, string> = {
  SCHEDULED: "Scheduled",
  LIVE: "Live",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function percent(count: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

function buildChartData(
  labels: Record<string, string>,
  counts: Map<string, number>
): { name: string; value: number; fill: string }[] {
  return Object.entries(labels).map(([key, label], index) => ({
    name: label,
    value: counts.get(key) ?? 0,
    fill: chartColors[index % chartColors.length],
  }));
}

function ChartBreakdownCard({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: { name: string; value: number; fill: string }[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DistributionPieChart data={data} />
        <div className="flex flex-col gap-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{percent(item.value, total)}</span>
                <Badge variant="secondary" className="rounded-full">
                  {item.value.toLocaleString()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminReportsPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");

  const [
    enrollmentByStatus,
    enrollmentByPathway,
    attendanceByStatus,
    classSessionsByStatus,
    certificateCount,
    coursesWithCounts,
  ] = await Promise.all([
    prisma.enrollment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.enrollment.groupBy({ by: ["pathwayLevel"], _count: { _all: true } }),
    prisma.attendance.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.classSession.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.certificate.count(),
    prisma.course.findMany({
      select: { id: true, name: true, isActive: true, _count: { select: { enrollments: true } } },
    }),
  ]);

  const totalEnrollments = enrollmentByStatus.reduce((sum, g) => sum + g._count._all, 0);
  const totalAttendance = attendanceByStatus.reduce((sum, g) => sum + g._count._all, 0);
  const totalSessions = classSessionsByStatus.reduce((sum, g) => sum + g._count._all, 0);

  const enrollmentStatusData = buildChartData(
    enrollmentStatusLabel,
    new Map(enrollmentByStatus.map((g) => [g.status, g._count._all]))
  );
  const pathwayData = buildChartData(
    pathwayLevelLabel,
    new Map(enrollmentByPathway.map((g) => [g.pathwayLevel, g._count._all]))
  );
  const attendanceData = buildChartData(
    attendanceStatusLabel,
    new Map(attendanceByStatus.map((g) => [g.status, g._count._all]))
  );
  const classStatusData = buildChartData(
    classStatusLabel,
    new Map(classSessionsByStatus.map((g) => [g.status, g._count._all]))
  );

  const topCourses = [...coursesWithCounts]
    .sort((a, b) => b._count.enrollments - a._count.enrollments)
    .slice(0, 10)
    .map((course, index) => ({
      name: course.name,
      enrollments: course._count.enrollments,
      fill: chartColors[index % chartColors.length],
    }));

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("reports")}
      description={t("reportsDesc")}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{totalEnrollments.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{t("reports.totalEnrollments")}</span>
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                <ClipboardCheck className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{totalAttendance.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{t("reports.attendanceRecords")}</span>
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/30 text-secondary-foreground">
                <BarChart3 className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{totalSessions.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{t("reports.classSessions")}</span>
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-chart-4/10 text-chart-4">
                <Award className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{certificateCount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{t("reports.certificatesIssued")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartBreakdownCard
            title={t("reports.enrollmentsByStatus")}
            description={t("reports.totalEnrollmentsCount", { count: totalEnrollments.toLocaleString() })}
            data={enrollmentStatusData}
          />
          <ChartBreakdownCard
            title={t("reports.enrollmentsByPathway")}
            description={t("reports.pathwayLevels")}
            data={pathwayData}
          />
          <ChartBreakdownCard
            title={t("reports.attendanceBreakdown")}
            description={t("reports.recordedAttendances", { count: totalAttendance.toLocaleString() })}
            data={attendanceData}
          />
          <ChartBreakdownCard
            title={t("reports.classSessionsByStatus")}
            description={t("reports.totalSessions", { count: totalSessions.toLocaleString() })}
            data={classStatusData}
          />
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("reports.topCoursesByEnrollment")}</CardTitle>
            <CardDescription>{t("reports.rankedByEnrolledStudents")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <EnrollmentChart data={topCourses} />
            <div className="flex flex-col gap-2">
              {topCourses.map((course, index) => {
                const original = coursesWithCounts.find((c) => c.name === course.name);
                return (
                  <div key={`${course.name}-${index}`} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <BookOpenCheck className="size-3.5" />
                      </span>
                      <span className="text-sm font-medium">{course.name}</span>
                      {original && !original.isActive && (
                        <Badge variant="outline" className="rounded-full">Inactive</Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      {t("reports.enrolled", { count: course.enrollments.toLocaleString() })}
                    </Badge>
                  </div>
                );
              })}

              {topCourses.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("reports.noCourses")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
