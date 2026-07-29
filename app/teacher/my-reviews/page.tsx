import { Star, TrendingUp } from "lucide-react";
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

function ScoreDot({ score }: { score: number }) {
  const color = score >= 8 ? "bg-green-500" : score >= 5 ? "bg-amber-500" : "bg-red-500";
  return <span className={`inline-block size-2.5 rounded-full ${color}`} />;
}

export default async function TeacherMyReviewsPage() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") throw new Error("Forbidden");

  const reviews = await prisma.teacherPerformanceReview.findMany({
    where: { teacherUserId: user.id },
    orderBy: { reviewedAt: "desc" },
    include: { reviewer: { select: { name: true } } },
  });

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.score, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="My Performance Reviews"
      description="Feedback from administrators on your teaching quality."
    >
      <div className="flex flex-col gap-6">
        {avg && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="flex flex-col rounded-xl border border-border bg-muted/30 p-4">
              <span className="font-heading text-3xl text-primary">{avg}</span>
              <span className="text-xs text-muted-foreground">Average score /10</span>
            </div>
            <div className="flex flex-col rounded-xl border border-border bg-muted/30 p-4">
              <span className="font-heading text-3xl text-primary">{reviews.length}</span>
              <span className="text-xs text-muted-foreground">Total reviews</span>
            </div>
          </div>
        )}

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="size-4" /> Review History
            </CardTitle>
            <CardDescription>
              {reviews.length === 0
                ? "No reviews recorded yet."
                : `${reviews.length} review${reviews.length === 1 ? "" : "s"} from admin.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    Reviewed by {r.reviewer.name} ·{" "}
                    {new Date(r.reviewedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <ScoreDot score={r.score} />
                    <span className="font-semibold">{r.score}/10</span>
                  </div>
                </div>
                {r.strengths && (
                  <div className="rounded-md bg-green-50 dark:bg-green-950/20 px-3 py-2 text-xs text-green-700 dark:text-green-400">
                    <span className="font-semibold">Strengths: </span>{r.strengths}
                  </div>
                )}
                {r.areasToImprove && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-semibold">Areas to improve: </span>{r.areasToImprove}
                  </div>
                )}
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Your administrator will record performance reviews here after observing your sessions.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
