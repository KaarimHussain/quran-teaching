import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpenCheck,
  Heart,
  ShieldCheck,
  UserCheck,
  Megaphone,
  BarChart3,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnrollmentChart } from "@/components/charts/enrollment-chart";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatRelativeTime } from "@/lib/format";
import { approveTeacher, rejectTeacher } from "./verifications/actions";
import { SubmitButton } from "@/components/ui/submit-button";

const usersByRoleConfig = [
  { role: "STUDENT" as const, label: "Students", icon: GraduationCap, color: "bg-primary/10 text-primary" },
  { role: "TEACHER" as const, label: "Teachers", icon: BookOpenCheck, color: "bg-accent/20 text-accent-foreground" },
  { role: "PARENT" as const, label: "Parents", icon: Heart, color: "bg-secondary/30 text-secondary-foreground" },
  { role: "SUPER_ADMIN" as const, label: "Super Admins", icon: ShieldCheck, color: "bg-chart-4/10 text-chart-4" },
];

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default async function AdminDashboardPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");

  const [
    totalUsers,
    totalEnrollments,
    pendingVerificationCount,
    activeCourseCount,
    usersByRoleGroups,
    pendingVerifications,
    coursesWithCounts,
    forumQueue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.enrollment.count(),
    prisma.user.count({ where: { role: "TEACHER", verificationStatus: "PENDING" } }),
    prisma.course.count({ where: { isActive: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.user.findMany({
      where: { role: "TEACHER", verificationStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 3,
      select: { id: true, name: true, isVolunteer: true, createdAt: true },
    }),
    prisma.course.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, isActive: true, _count: { select: { enrollments: true } } },
    }),
    prisma.forumPost.findMany({
      where: { isRemoved: false },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: { select: { name: true } },
        course: { select: { name: true } },
      },
    }),
  ]);

  const stats = [
    { label: t("dash.totalUsers"), value: totalUsers.toLocaleString(), icon: Users, color: "bg-primary/10 text-primary" },
    { label: t("dash.totalEnrollments"), value: totalEnrollments.toLocaleString(), icon: BarChart3, color: "bg-accent/20 text-accent-foreground" },
    { label: t("dash.pendingVerifications"), value: pendingVerificationCount.toLocaleString(), icon: UserCheck, color: "bg-secondary/30 text-secondary-foreground" },
    { label: t("dash.activeCourses"), value: activeCourseCount.toLocaleString(), icon: BookOpenCheck, color: "bg-chart-4/10 text-chart-4" },
  ];

  const countByRole = new Map(usersByRoleGroups.map((group) => [group.role, group._count._all]));
  const usersByRole = usersByRoleConfig.map((config) => ({
    role: config.label,
    count: countByRole.get(config.role) ?? 0,
    icon: config.icon,
    color: config.color,
  }));

  const courses = coursesWithCounts.map((course, index) => ({
    id: course.id,
    name: course.name,
    enrollments: course._count.enrollments,
    status: course.isActive ? t("dash.active") : t("dash.inactive"),
    fill: chartColors[index % chartColors.length],
  }));

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("dashboard")}
      description={t("dashboardDesc")}
    >
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} size="sm" className="border-border/80">
              <CardContent className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-xl text-primary">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Enrollments overview */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>{t("dash.enrollmentsByCourse")}</CardTitle>
                <CardDescription>{t("dash.activeLearnersPerCourse")}</CardDescription>
              </CardHeader>
              <CardContent>
                <EnrollmentChart data={courses} />
              </CardContent>
            </Card>

            {/* Users by role */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("dash.usersByRole")}</CardTitle>
                  <CardDescription>{t("dash.platformWideBreakdown")}</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/admin/users">
                    {t("dash.manageUsers")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {usersByRole.map((item) => (
                  <div
                    key={item.role}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center"
                  >
                    <span className={`flex size-10 items-center justify-center rounded-xl ${item.color}`}>
                      <item.icon className="size-5" />
                    </span>
                    <span className="font-heading text-lg text-primary">{item.count}</span>
                    <span className="text-xs text-muted-foreground">{item.role}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Course management */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("dash.courseManagement")}</CardTitle>
                  <CardDescription>{t("dash.enrollmentCountsAndStatus")}</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/admin/courses">
                    {t("dash.manageCourses")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <span className="text-sm font-medium">{course.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {t("dash.enrolled", { count: course.enrollments.toLocaleString() })}
                      </span>
                      <Badge variant="secondary" className="rounded-full">
                        {course.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Pending teacher verifications */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{t("dash.teacherVerifications")}</CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/admin/verifications">
                    {t("dash.all")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {pendingVerifications.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-border p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.isVolunteer ? t("dash.volunteerTeacher") : t("dash.paidTeacher")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("dash.submitted")} {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <form action={approveTeacher} className="flex-1">
                        <input type="hidden" name="userId" value={item.id} />
                        <SubmitButton size="sm" className="w-full rounded-full" pendingLabel={t("dash.approving")}>
                          <Check className="size-3.5" /> {t("dash.approve")}
                        </SubmitButton>
                      </form>
                      <form action={rejectTeacher} className="flex-1">
                        <input type="hidden" name="userId" value={item.id} />
                        <SubmitButton size="sm" variant="outline" className="w-full rounded-full" pendingLabel={t("dash.rejecting")}>
                          <X className="size-3.5" /> {t("dash.reject")}
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                ))}
                {pendingVerifications.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("dash.noPendingApplications")}</p>
                )}
              </CardContent>
            </Card>

            {/* Forum moderation queue */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{t("dash.forumModeration")}</CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/admin/forum">
                    {t("dash.openQueue")} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {forumQueue.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Megaphone className="size-3.5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {t("dash.by")} {item.author.name} · {item.course?.name ?? t("dash.general")} ·{" "}
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                {forumQueue.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("dash.noRecentPosts")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
