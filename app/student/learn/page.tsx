import { Layers, PlayCircle, FileText, Volume2, HelpCircle, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { CompleteButton } from "./complete-button";

const TYPE_ICON: Record<string, React.ReactNode> = {
  VIDEO: <PlayCircle className="size-4 text-blue-500" />,
  TEXT: <FileText className="size-4 text-muted-foreground" />,
  AUDIO: <Volume2 className="size-4 text-purple-500" />,
  QUIZ: <HelpCircle className="size-4 text-amber-500" />,
};

export default async function StudentLearnPage() {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  // Enrolled course IDs
  const enrollments = await prisma.enrollment.findMany({
    where: { studentUserId: user.id, status: "ACTIVE" },
    select: { courseId: true },
  });
  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  // Fetch modules: free ones OR for enrolled courses
  const modules = await prisma.courseModule.findMany({
    where: {
      OR: [
        { isFree: true },
        { courseId: { in: enrolledCourseIds } },
      ],
    },
    orderBy: [{ courseId: "asc" }, { moduleOrder: "asc" }],
    include: {
      course: { select: { name: true } },
      contents: { orderBy: { contentOrder: "asc" } },
    },
  });

  // Completed content IDs for this student
  const completedRecords = await prisma.moduleProgress.findMany({
    where: { studentUserId: user.id },
    select: { moduleContentId: true },
  });
  const completedIds = new Set(completedRecords.map((r) => r.moduleContentId));

  // Group by course
  const byCourse = new Map<string, { name: string; modules: typeof modules }>();
  for (const mod of modules) {
    const courseKey = mod.courseId;
    if (!byCourse.has(courseKey)) {
      byCourse.set(courseKey, { name: mod.course.name, modules: [] });
    }
    byCourse.get(courseKey)!.modules.push(mod);
  }

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Self-Paced Learning"
      description="Work through course modules at your own pace, any time."
    >
      <div className="flex flex-col gap-8">
        {byCourse.size === 0 && (
          <p className="text-sm text-muted-foreground">
            No modules available yet. Enroll in a course or check back later.
          </p>
        )}
        {Array.from(byCourse.entries()).map(([, { name, modules: mods }]) => {
          const allContents = mods.flatMap((m) => m.contents);
          const completedCount = allContents.filter((c) => completedIds.has(c.id)).length;
          const pct =
            allContents.length > 0
              ? Math.round((completedCount / allContents.length) * 100)
              : 0;

          return (
            <div key={name} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-lg">{name}</h2>
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{allContents.length} completed · {pct}%
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />

              {mods.map((mod) => {
                const modCompleted = mod.contents.filter((c) => completedIds.has(c.id)).length;
                const modPct =
                  mod.contents.length > 0
                    ? Math.round((modCompleted / mod.contents.length) * 100)
                    : 0;

                return (
                  <Card key={mod.id} className="border-border/80">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm font-semibold">
                          <Layers className="size-3.5 inline mr-1.5" />
                          {mod.moduleOrder}. {mod.title}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">{modPct}%</span>
                      </div>
                      {mod.description && (
                        <CardDescription className="text-xs">{mod.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      {mod.contents.length === 0 && (
                        <p className="text-xs text-muted-foreground">No content yet.</p>
                      )}
                      {mod.contents.map((content) => {
                        const done = completedIds.has(content.id);
                        return (
                          <div
                            key={content.id}
                            className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${done ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20" : "border-border"}`}
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {TYPE_ICON[content.contentType]}
                                <span className="text-sm font-medium">{content.title}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {content.contentType}
                                </Badge>
                              </div>
                              {content.videoUrl && (
                                <a
                                  href={content.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary underline underline-offset-2"
                                >
                                  Open resource →
                                </a>
                              )}
                              {content.body && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {content.body}
                                </p>
                              )}
                              {content.durationMins && (
                                <span className="text-xs text-muted-foreground">
                                  ~{content.durationMins} min
                                </span>
                              )}
                            </div>
                            <CompleteButton contentId={content.id} done={done} />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
