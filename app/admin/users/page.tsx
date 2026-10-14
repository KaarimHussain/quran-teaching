import { Search, Users as UsersIcon, UserCheck, UserX, GraduationCap, BookOpenCheck, Heart, ShieldCheck, Link2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { toggleUserActive } from "./actions";
import { LinkParentForm } from "./link-parent-form";
import { unlinkParentFromStudent } from "./link-parent-actions";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const roleStyles: Record<string, { color: string; icon: typeof GraduationCap }> = {
  STUDENT: { color: "bg-primary/10 text-primary", icon: GraduationCap },
  TEACHER: { color: "bg-accent/20 text-accent-foreground", icon: BookOpenCheck },
  PARENT: { color: "bg-secondary/30 text-secondary-foreground", icon: Heart },
  SUPER_ADMIN: { color: "bg-chart-4/10 text-chart-4", icon: ShieldCheck },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [users, totalUsers, activeCount, parents, students, existingLinks] = await Promise.all([
    prisma.user.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, isActive: true },
      take: 100,
    }),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.findMany({ where: { role: "PARENT" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "STUDENT" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.parentStudentLink.findMany({
      include: {
        parent: { select: { name: true } },
        student: { select: { name: true } },
      },
    }),
  ]);

  const suspendedCount = totalUsers - activeCount;
  const activeRate = totalUsers === 0 ? 0 : Math.round((activeCount / totalUsers) * 100);

  const stats = [
    { label: t("usersPage.totalUsers"), value: totalUsers, icon: UsersIcon, color: "bg-primary/10 text-primary" },
    { label: t("usersPage.active"), value: activeCount, icon: UserCheck, color: "bg-chart-4/10 text-chart-4" },
    { label: t("usersPage.suspended"), value: suspendedCount, icon: UserX, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("users")}
      description={t("usersDesc")}
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
          <Card size="sm" className="border-border/80">
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("usersPage.activeRate")}</span>
                <span className="font-heading text-primary">{activeRate}%</span>
              </div>
              <Progress value={activeRate} />
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("usersPage.allUsers")}</CardTitle>
            <CardDescription>
              {query ? t("usersPage.showingResultsFor", { query }) : t("usersPage.accounts", { count: users.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder={t("usersPage.searchPlaceholder")}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" className="rounded-full">
                {t("usersPage.search")}
              </Button>
            </form>

            <div className="flex flex-col gap-2">
              {users.map((user) => {
                const style = roleStyles[user.role] ?? roleStyles.STUDENT;
                return (
                  <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar>
                        <AvatarFallback className={style.color}>{initials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium leading-tight">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary" className={`gap-1 rounded-full ${style.color}`}>
                        <style.icon className="size-3" />
                        {roleLabel[user.role]}
                      </Badge>
                      <Badge variant={user.isActive ? "default" : "destructive"} className="rounded-full">
                        {user.isActive ? t("usersPage.active") : t("usersPage.suspended")}
                      </Badge>
                      {user.id !== currentUser.id && (
                        <form action={toggleUserActive}>
                          <input type="hidden" name="userId" value={user.id} />
                          <SubmitButton
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            pendingLabel={t("usersPage.saving")}
                          >
                            {user.isActive ? t("usersPage.suspend") : t("usersPage.activate")}
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}

              {users.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  <UsersIcon className="size-6" />
                  <span className="text-sm">{t("usersPage.noUsersMatch")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Parent-Student Links */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="size-4" /> {t("usersPage.parentStudentLinks")}
            </CardTitle>
            <CardDescription>{t("usersPage.parentStudentLinksDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <LinkParentForm parents={parents} students={students} />

            {existingLinks.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">{t("usersPage.existingLinks")}</p>
                {existingLinks.map((link) => (
                  <div key={`${link.parentUserId}-${link.studentUserId}`} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <span>
                      <span className="font-medium">{link.parent.name}</span>
                      <span className="mx-2 text-muted-foreground">â†’</span>
                      <span className="font-medium">{link.student.name}</span>
                    </span>
                    <form action={unlinkParentFromStudent}>
                      <input type="hidden" name="parentId" value={link.parentUserId} />
                      <input type="hidden" name="studentId" value={link.studentUserId} />
                      <SubmitButton
                        variant="outline"
                        size="sm"
                        className="rounded-full text-destructive hover:text-destructive"
                        pendingLabel={t("usersPage.removing")}
                      >
                        {t("usersPage.unlink")}
                      </SubmitButton>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
