import Link from "next/link";
import { ClipboardCheck, CheckCircle2, XCircle, Download } from "lucide-react";
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

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function StudentAssessmentsPage() {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  const results = await prisma.assessmentResult.findMany({
    where: { studentUserId: user.id },
    orderBy: { gradedAt: "desc" },
    include: {
      assessment: {
        include: { course: { select: { name: true } } },
      },
      gradedBy: { select: { name: true } },
    },
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Assessments"
      description="Your level-up assessment results and examination transcript."
    >
      <div className="flex flex-col gap-6">
        {results.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="font-heading text-2xl text-primary">{results.length}</span>
                <span className="text-xs text-muted-foreground">total taken</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl text-green-600">{passed}</span>
                <span className="text-xs text-muted-foreground">passed</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl text-destructive">{failed}</span>
                <span className="text-xs text-muted-foreground">failed</span>
              </div>
            </div>
            <Button asChild variant="outline" className="rounded-full gap-1">
              <Link href={`/api/transcript/${user.id}`} target="_blank">
                <Download className="size-4" /> Download Transcript (PDF)
              </Link>
            </Button>
          </div>
        )}

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-4" /> Assessment Results
            </CardTitle>
            <CardDescription>
              {results.length === 0
                ? "No assessments recorded yet."
                : `${results.length} result${results.length === 1 ? "" : "s"} on record.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {results.map((r) => (
              <div key={r.id} className="flex flex-col gap-1.5 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium leading-tight">{r.assessment.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.assessment.course.name} · {levelLabel[r.assessment.pathwayLevel]} ·{" "}
                      graded by {r.gradedBy.name} ·{" "}
                      {new Date(r.gradedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{r.score}%</span>
                    {r.passed ? (
                      <Badge variant="secondary" className="rounded-full gap-1">
                        <CheckCircle2 className="size-3" /> Pass
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full gap-1 text-destructive border-destructive/40">
                        <XCircle className="size-3" /> Fail
                      </Badge>
                    )}
                  </div>
                </div>
                {r.notes && (
                  <p className="rounded-md bg-muted px-2.5 py-2 text-xs text-muted-foreground">
                    {r.notes}
                  </p>
                )}
              </div>
            ))}
            {results.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Your teacher will record assessment results here after evaluating your progress.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
