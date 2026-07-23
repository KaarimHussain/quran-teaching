import { UserCheck, Check, X, Clock, ShieldCheck, ShieldQuestion, ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { approveTeacher, rejectTeacher } from "./actions";

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

  const [pending, decided, statusGroups] = await Promise.all([
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
  ]);

  const countByStatus = new Map(statusGroups.map((group) => [group.verificationStatus, group._count._all]));
  const verifiedCount = countByStatus.get("VERIFIED") ?? 0;
  const rejectedCount = countByStatus.get("REJECTED") ?? 0;
  const pendingCount = countByStatus.get("PENDING") ?? 0;

  const stats = [
    { label: "Pending", value: pendingCount, icon: ShieldQuestion, color: "bg-secondary/30 text-secondary-foreground" },
    { label: "Verified", value: verifiedCount, icon: ShieldCheck, color: "bg-chart-4/10 text-chart-4" },
    { label: "Rejected", value: rejectedCount, icon: ShieldAlert, color: "bg-destructive/10 text-destructive" },
  ];

  const pieData = [
    { name: "Pending", value: pendingCount, fill: "var(--chart-3)" },
    { name: "Verified", value: verifiedCount, fill: "var(--chart-1)" },
    { name: "Rejected", value: rejectedCount, fill: "var(--chart-5)" },
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
              <CardTitle>Status Breakdown</CardTitle>
              <CardDescription>All teacher accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionPieChart data={pieData} />
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>
              {pending.length === 0
                ? "No teachers are awaiting verification."
                : `${pending.length} teacher${pending.length === 1 ? "" : "s"} awaiting review`}
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
                      {teacher.isVolunteer ? "Volunteer Teacher" : "Paid Teacher"} · Submitted{" "}
                      {formatRelativeTime(teacher.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={approveTeacher}>
                    <input type="hidden" name="userId" value={teacher.id} />
                    <SubmitButton size="sm" className="rounded-full" pendingLabel="Approving…">
                      <Check className="size-3.5" /> Approve
                    </SubmitButton>
                  </form>
                  <form action={rejectTeacher}>
                    <input type="hidden" name="userId" value={teacher.id} />
                    <SubmitButton size="sm" variant="outline" className="rounded-full" pendingLabel="Rejecting…">
                      <X className="size-3.5" /> Reject
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <UserCheck className="size-6" />
                <span className="text-sm">All caught up — no pending applications.</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Recently Decided</CardTitle>
            <CardDescription>Last 5 verification decisions</CardDescription>
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
              <p className="text-sm text-muted-foreground">No decisions yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
