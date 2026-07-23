import { UserCheck, Check, X, Clock, ShieldCheck, ShieldQuestion, ShieldAlert, Award, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DistributionPieChart } from "@/components/charts/distribution-pie-chart";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatRelativeTime } from "@/lib/format";
import { approveTeacher, rejectTeacher, awardBadge, revokeBadge } from "./actions";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AdminVerificationsPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");

  const [pending, decided, statusGroups, verifiedTeachers, allBadges] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEACHER", verificationStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, isVolunteer: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { role: "TEACHER", verificationStatus: { in: ["VERIFIED", "REJECTED"] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, verificationStatus: true, updatedAt: true },
    }),
    prisma.user.groupBy({ by: ["verificationStatus"], where: { role: "TEACHER" }, _count: { _all: true } }),
    prisma.user.findMany({
      where: { role: "TEACHER", verificationStatus: "VERIFIED" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.teacherBadge.findMany({
      orderBy: { awardedAt: "desc" },
      include: {
        teacher: { select: { id: true, name: true } },
        awardedBy: { select: { name: true } },
      },
    }),
  ]);

  const countByStatus = new Map(statusGroups.map((group) => [group.verificationStatus, group._count._all]));
  const verifiedCount = countByStatus.get("VERIFIED") ?? 0;
  const rejectedCount = countByStatus.get("REJECTED") ?? 0;
  const pendingCount = countByStatus.get("PENDING") ?? 0;

  const stats = [
    { label: t("verif.pending"), value: pendingCount, icon: ShieldQuestion, color: "bg-secondary/30 text-secondary-foreground" },
    { label: t("verif.verified"), value: verifiedCount, icon: ShieldCheck, color: "bg-chart-4/10 text-chart-4" },
    { label: t("verif.rejected"), value: rejectedCount, icon: ShieldAlert, color: "bg-destructive/10 text-destructive" },
  ];

  const pieData = [
    { name: t("verif.pending"), value: pendingCount, fill: "var(--chart-3)" },
    { name: t("verif.verified"), value: verifiedCount, fill: "var(--chart-1)" },
    { name: t("verif.rejected"), value: rejectedCount, fill: "var(--chart-5)" },
  ];

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("verifications")}
      description={t("verificationsDesc")}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-4 lg:col-span-2 sm:grid-cols-3">
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
              <CardTitle>{t("verif.statusBreakdown")}</CardTitle>
              <CardDescription>{t("verif.allTeacherAccounts")}</CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionPieChart data={pieData} />
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("verif.pendingVerifications")}</CardTitle>
            <CardDescription>
              {pending.length === 0
                ? t("verif.noTeachersAwaiting")
                : t("verif.teachersAwaitingReview", { count: pending.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pending.map((teacher) => (
              <div key={teacher.id} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-secondary/30 text-secondary-foreground">{initials(teacher.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">{teacher.name}</span>
                    <span className="text-xs text-muted-foreground">{teacher.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {teacher.isVolunteer ? t("verif.volunteerTeacher") : t("verif.paidTeacher")} · {t("verif.submitted")}{" "}
                      {formatRelativeTime(teacher.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={approveTeacher}>
                    <input type="hidden" name="userId" value={teacher.id} />
                    <SubmitButton size="sm" className="rounded-full" pendingLabel={t("verif.approving")}>
                      <Check className="size-3.5" /> {t("verif.approve")}
                    </SubmitButton>
                  </form>
                  <form action={rejectTeacher}>
                    <input type="hidden" name="userId" value={teacher.id} />
                    <SubmitButton size="sm" variant="outline" className="rounded-full" pendingLabel={t("verif.rejecting")}>
                      <X className="size-3.5" /> {t("verif.reject")}
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <UserCheck className="size-6" />
                <span className="text-sm">{t("verif.allCaughtUp")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("verif.recentlyDecided")}</CardTitle>
            <CardDescription>{t("verif.last5Decisions")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {decided.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={teacher.verificationStatus === "VERIFIED" ? "bg-chart-4/10 text-chart-4" : "bg-destructive/10 text-destructive"}>
                      {initials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">{teacher.name}</span>
                    <span className="text-xs text-muted-foreground">{teacher.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {formatRelativeTime(teacher.updatedAt)}
                  </span>
                  <Badge variant={teacher.verificationStatus === "VERIFIED" ? "default" : "destructive"} className="rounded-full">
                    {teacher.verificationStatus}
                  </Badge>
                </div>
              </div>
            ))}
            {decided.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("verif.noDecisionsYet")}</p>
            )}
          </CardContent>
        </Card>

        {/* Teacher Badges */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-4" /> {t("verif.teacherBadges")}
            </CardTitle>
            <CardDescription>
              {t("verif.teacherBadgesDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {verifiedTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("verif.noVerifiedTeachers")}</p>
            ) : (
              <form action={awardBadge} className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium leading-none">{t("verif.teacher")}</label>
                  <select
                    name="teacherUserId"
                    required
                    className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">{t("verif.selectTeacher")}</option>
                    {verifiedTeachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium leading-none">{t("verif.badgeName")}</label>
                  <Input
                    name="badgeName"
                    list="badge-presets"
                    placeholder={t("verif.badgeNamePlaceholder")}
                    required
                    minLength={2}
                    className="w-52"
                  />
                  <datalist id="badge-presets">
                    <option value="Verified Teacher" />
                    <option value="Hifz Specialist" />
                    <option value="Tajweed Expert" />
                    <option value="Tafseer Scholar" />
                    <option value="Quran Memorizer" />
                    <option value="Community Mentor" />
                  </datalist>
                </div>
                <SubmitButton className="rounded-full" pendingLabel={t("verif.awarding")}>
                  <Award className="size-3.5" /> {t("verif.awardBadge")}
                </SubmitButton>
              </form>
            )}

            {allBadges.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">{t("verif.awardedBadges", { count: allBadges.length })}</p>
                {allBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Award className="size-3.5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-tight">{badge.badgeName}</span>
                        <span className="text-xs text-muted-foreground">
                          {badge.teacher.name} · {t("verif.awardedBy")} {badge.awardedBy.name} ·{" "}
                          {formatRelativeTime(badge.awardedAt)}
                        </span>
                      </div>
                    </div>
                    <form action={revokeBadge}>
                      <input type="hidden" name="badgeId" value={badge.id} />
                      <SubmitButton
                        size="sm"
                        variant="outline"
                        className="rounded-full text-destructive hover:text-destructive"
                        pendingLabel={t("verif.revoking")}
                      >
                        <Trash2 className="size-3.5" /> {t("verif.revoke")}
                      </SubmitButton>
                    </form>
                  </div>
                ))}
              </div>
            )}

            {allBadges.length === 0 && verifiedTeachers.length > 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
                <Award className="size-5" />
                <span className="text-sm">{t("verif.noBadgesYet")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
