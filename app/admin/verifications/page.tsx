import { UserCheck, Check, X, Clock } from "lucide-react";
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
import { formatRelativeTime } from "@/lib/format";
import { approveTeacher, rejectTeacher } from "./actions";

export default async function AdminVerificationsPage() {
  const currentUser = await requireCurrentUser();

  const [pending, decided] = await Promise.all([
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
  ]);

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title="Teacher Verification"
      description="Review and approve volunteer and paid teacher applications."
    >
      <div className="flex flex-col gap-6">
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
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">{teacher.name}</span>
                  <span className="text-xs text-muted-foreground">{teacher.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {teacher.isVolunteer ? "Volunteer Teacher" : "Paid Teacher"} · Submitted{" "}
                    {formatRelativeTime(teacher.createdAt)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <form action={approveTeacher}>
                    <input type="hidden" name="userId" value={teacher.id} />
                    <Button size="sm" type="submit" className="rounded-full">
                      <Check className="size-3.5" /> Approve
                    </Button>
                  </form>
                  <form action={rejectTeacher}>
                    <input type="hidden" name="userId" value={teacher.id} />
                    <Button size="sm" type="submit" variant="outline" className="rounded-full">
                      <X className="size-3.5" /> Reject
                    </Button>
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
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">{teacher.name}</span>
                  <span className="text-xs text-muted-foreground">{teacher.email}</span>
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
