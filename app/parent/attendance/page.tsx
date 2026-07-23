import { CalendarCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
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
import type { AttendanceStatus } from "@/lib/generated/prisma/client";

const statusIcon: Record<AttendanceStatus, React.ReactNode> = {
  PRESENT: <CheckCircle2 className="size-4 text-chart-4" />,
  ABSENT: <XCircle className="size-4 text-destructive" />,
  LATE: <Clock className="size-4 text-yellow-500" />,
};

const statusVariant: Record<AttendanceStatus, "secondary" | "outline" | "destructive"> = {
  PRESENT: "secondary",
  ABSENT: "destructive",
  LATE: "outline",
};

export default async function ParentAttendancePage() {
  const user = await requireCurrentUser();
  const t = await getTranslations("pages.parent");

  const links = await prisma.parentStudentLink.findMany({
    where: { parentUserId: user.id },
    include: {
      student: {
        include: {
          attendances: {
            include: {
              classSession: { include: { course: true } },
            },
            orderBy: { classSession: { scheduledStart: "desc" } },
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
      title={t("attendance")}
      description={t("attendanceDesc")}
    >
      {links.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <CalendarCheck className="size-8" />
          <p className="text-sm">{t("attendancePage.noChildrenLinked")}</p>
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
            const records = student.attendances;
            const presentCount = records.filter((r) => r.status === "PRESENT").length;
            const absentCount = records.filter((r) => r.status === "ABSENT").length;
            const lateCount = records.filter((r) => r.status === "LATE").length;
            const attended = presentCount + lateCount;
            const rate = records.length === 0 ? 0 : Math.round((attended / records.length) * 100);

            return (
              <TabsContent key={student.id} value={student.id} className="mt-4 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: t("attendancePage.totalClasses"), value: records.length, cls: "text-primary" },
                    { label: t("attendancePage.present"), value: presentCount, cls: "text-chart-4" },
                    { label: t("attendancePage.absent"), value: absentCount, cls: "text-destructive" },
                    { label: t("attendancePage.attendanceRate"), value: `${rate}%`, cls: "text-primary" },
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
                    <CardTitle>{t("attendancePage.attendanceHistory")}</CardTitle>
                    <CardDescription>{t("attendancePage.classSessions", { count: records.length })}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {records.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("attendancePage.noAttendanceRecords")}</p>
                    ) : (
                      records.map((record) => (
                        <div key={record.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                          <div className="flex items-center gap-3">
                            {statusIcon[record.status]}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{record.classSession.course.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(record.classSession.scheduledStart)}
                              </span>
                            </div>
                          </div>
                          <Badge variant={statusVariant[record.status]} className="rounded-full">
                            {record.status === "PRESENT" ? t("attendancePage.present") : record.status === "ABSENT" ? t("attendancePage.absent") : t("attendancePage.late")}
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
