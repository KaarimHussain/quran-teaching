import { CalendarX2, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { ApproveMakeupForm } from "./approve-form";

function fmt(d: Date) {
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING:  { label: "Pending",  variant: "outline" },
  APPROVED: { label: "Approved", variant: "default" },
  DENIED:   { label: "Denied",   variant: "destructive" },
};

export default async function AdminMakeupPage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const [pending, resolved] = await Promise.all([
    prisma.makeupRequest.findMany({
      where: { status: "PENDING" },
      include: {
        student: { select: { name: true, email: true } },
        originalSession: {
          select: {
            scheduledStart: true,
            course: { select: { name: true } },
            teacher: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.makeupRequest.findMany({
      where: { status: { not: "PENDING" } },
      include: {
        student: { select: { name: true } },
        originalSession: {
          select: {
            scheduledStart: true,
            course: { select: { name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Makeup Requests"
      description="Review and schedule makeup sessions for students who missed a class."
    >
      <div className="flex flex-col gap-6">
        {/* Pending */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarX2 className="size-4" /> Pending Requests
            </CardTitle>
            <CardDescription>
              {pending.length === 0
                ? "No pending makeup requests."
                : `${pending.length} request${pending.length === 1 ? "" : "s"} awaiting review.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {pending.map((req) => (
              <div key={req.id} className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{req.originalSession.course.name}</span>
                      <Badge variant="outline" className="rounded-full text-xs">Pending</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> Missed: {fmt(req.originalSession.scheduledStart)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="size-3" /> {req.student.name} · Teacher: {req.originalSession.teacher.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    Requested {formatRelativeTime(req.createdAt)}
                  </span>
                </div>

                {req.reason && (
                  <p className="text-sm text-muted-foreground italic rounded-lg bg-muted/40 px-3 py-2">
                    "{req.reason}"
                  </p>
                )}

                <ApproveMakeupForm requestId={req.id} />
              </div>
            ))}

            {pending.length === 0 && (
              <p className="text-sm text-muted-foreground">All caught up — no pending requests.</p>
            )}
          </CardContent>
        </Card>

        {/* Recently resolved */}
        {resolved.length > 0 && (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Recently Resolved</CardTitle>
              <CardDescription>Last 20 approved or denied requests.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {resolved.map((req) => {
                const badge = statusBadge[req.status];
                return (
                  <div key={req.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-medium truncate">{req.originalSession.course.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {req.student.name} · Missed {fmt(req.originalSession.scheduledStart)}
                      </span>
                      {req.status === "APPROVED" && req.proposedAt && (
                        <span className="text-xs text-primary">Makeup: {fmt(req.proposedAt)}</span>
                      )}
                    </div>
                    <Badge variant={badge.variant} className="rounded-full text-xs shrink-0">
                      {badge.label}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
