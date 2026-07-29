import { CalendarX2, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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
import { RequestMakeupForm } from "./request-form";

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
  PENDING:  { label: "Pending review", variant: "outline" },
  APPROVED: { label: "Approved",       variant: "default" },
  DENIED:   { label: "Denied",         variant: "destructive" },
};

export default async function StudentMakeupPage() {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [absences, myRequests] = await Promise.all([
    // Sessions the student was marked ABSENT in the last 30 days
    prisma.attendance.findMany({
      where: {
        studentUserId: user.id,
        status: "ABSENT",
        recordedAt: { gte: thirtyDaysAgo },
      },
      include: {
        classSession: {
          select: {
            id: true,
            scheduledStart: true,
            course: { select: { name: true } },
            makeupRequests: {
              where: { studentUserId: user.id },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { recordedAt: "desc" },
    }),
    // All makeup requests by this student
    prisma.makeupRequest.findMany({
      where: { studentUserId: user.id },
      include: {
        originalSession: {
          select: {
            scheduledStart: true,
            course: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const unrequestedAbsences = absences.filter(
    (a) => a.classSession.makeupRequests.length === 0
  );

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Makeup Classes"
      description="Request a makeup session for any class you missed."
    >
      <div className="flex flex-col gap-6">
        {/* Unrequested absences */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarX2 className="size-4" /> Missed Classes
            </CardTitle>
            <CardDescription>
              {unrequestedAbsences.length === 0
                ? "No missed classes in the last 30 days without a makeup request."
                : `${unrequestedAbsences.length} missed class${unrequestedAbsences.length === 1 ? "" : "es"} — you can request a makeup for each.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {unrequestedAbsences.map((absence) => (
              <div
                key={absence.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{absence.classSession.course.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> {fmt(absence.classSession.scheduledStart)}
                    </span>
                  </div>
                  <Badge variant="destructive" className="rounded-full text-xs gap-1">
                    <AlertCircle className="size-3" /> Absent
                  </Badge>
                </div>
                <RequestMakeupForm sessionId={absence.classSession.id} />
              </div>
            ))}

            {unrequestedAbsences.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing to request at the moment.</p>
            )}
          </CardContent>
        </Card>

        {/* Existing requests */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Your Makeup Requests</CardTitle>
            <CardDescription>
              {myRequests.length === 0 ? "You haven't submitted any makeup requests yet." : `${myRequests.length} request${myRequests.length === 1 ? "" : "s"} submitted.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {myRequests.map((req) => {
              const badge = statusBadge[req.status];
              return (
                <div key={req.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{req.originalSession.course.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Missed: {fmt(req.originalSession.scheduledStart)}
                      </span>
                    </div>
                    <Badge variant={badge.variant} className="rounded-full text-xs shrink-0">
                      {badge.label}
                    </Badge>
                  </div>

                  {req.reason && (
                    <p className="text-xs text-muted-foreground italic">"{req.reason}"</p>
                  )}

                  {req.status === "APPROVED" && req.proposedAt && (
                    <div className="flex flex-col gap-1 rounded-lg bg-primary/10 px-3 py-2">
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Makeup Scheduled
                      </span>
                      <span className="text-xs text-primary">{fmt(req.proposedAt)}</span>
                      {req.joinUrl && (
                        <a
                          href={req.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline underline-offset-2"
                        >
                          Join class →
                        </a>
                      )}
                      {req.adminNote && (
                        <p className="text-xs text-primary/80 mt-0.5">Note: {req.adminNote}</p>
                      )}
                    </div>
                  )}

                  {req.status === "DENIED" && (
                    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      <XCircle className="size-3.5 mt-0.5 shrink-0" />
                      <span>{req.adminNote ?? "This request was not approved."}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {myRequests.length === 0 && (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
