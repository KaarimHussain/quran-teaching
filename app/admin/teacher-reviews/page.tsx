import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { CreateReviewForm } from "./create-review-form";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? "bg-green-100 text-green-700 border-green-200"
      : score >= 5
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      <Star className="size-3" /> {score}/10
    </span>
  );
}

export default async function AdminTeacherReviewsPage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const [teachers, reviews] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEACHER", verificationStatus: "VERIFIED" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.teacherPerformanceReview.findMany({
      orderBy: { reviewedAt: "desc" },
      include: {
        teacher: { select: { name: true } },
        reviewer: { select: { name: true } },
      },
    }),
  ]);

  const avgByTeacher = new Map<string, { name: string; avg: number; count: number }>();
  for (const r of reviews) {
    const entry = avgByTeacher.get(r.teacherUserId) ?? {
      name: r.teacher.name,
      avg: 0,
      count: 0,
    };
    entry.avg = (entry.avg * entry.count + r.score) / (entry.count + 1);
    entry.count += 1;
    avgByTeacher.set(r.teacherUserId, entry);
  }

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Teacher Performance Reviews"
      description="Record and track ongoing performance assessments for your teachers."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>New Review</CardTitle>
            <CardDescription>Record a performance review for a verified teacher.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateReviewForm teachers={teachers} />
          </CardContent>
        </Card>

        {avgByTeacher.size > 0 && (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Average Scores by Teacher</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {Array.from(avgByTeacher.values())
                .sort((a, b) => b.avg - a.avg)
                .map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between rounded-lg border border-border px-4 py-2">
                    <span className="text-sm font-medium">{entry.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{entry.count} review{entry.count === 1 ? "" : "s"}</span>
                      <ScoreBadge score={Math.round(entry.avg)} />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="size-4" /> All Reviews
            </CardTitle>
            <CardDescription>
              {reviews.length === 0 ? "No reviews yet." : `${reviews.length} review${reviews.length === 1 ? "" : "s"} on record.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{r.teacher.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Reviewed by {r.reviewer.name} ·{" "}
                      {new Date(r.reviewedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <ScoreBadge score={r.score} />
                </div>
                {r.strengths && (
                  <div className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
                    <span className="font-semibold">Strengths: </span>{r.strengths}
                  </div>
                )}
                {r.areasToImprove && (
                  <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <span className="font-semibold">Areas to improve: </span>{r.areasToImprove}
                  </div>
                )}
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">No performance reviews recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
