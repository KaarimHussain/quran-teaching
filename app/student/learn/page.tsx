import { Layers, PlayCircle, FileText, Volume2, HelpCircle, Lock, CheckCircle2, Info } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
import { computeModuleAccess, type ModuleState } from "@/lib/curriculum/access";
import { STAGES } from "@/lib/curriculum/data";
import { ModuleSections } from "@/components/curriculum/module-sections";
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

  // Free modules + modules for actively-enrolled courses, fetched in parallel with
  // the student's completion records and teacher sign-offs.
  const [t, modules, completedRecords, signOffs] = await Promise.all([
    getTranslations("pages.student.learn"),
    prisma.courseModule.findMany({
      where: {
        OR: [
          { isFree: true },
          { course: { enrollments: { some: { studentUserId: user.id, status: "ACTIVE" } } } },
        ],
      },
      orderBy: [{ courseId: "asc" }, { moduleOrder: "asc" }],
      include: {
        course: { select: { name: true } },
        level: {
          select: { number: true, title: true, purpose: true, methodologyNote: true, minAge: true },
        },
        contents: { orderBy: { contentOrder: "asc" } },
      },
    }),
    prisma.moduleProgress.findMany({
      where: { studentUserId: user.id },
      select: { moduleContentId: true },
    }),
    prisma.moduleSignOff.findMany({
      where: { studentUserId: user.id },
      select: { moduleId: true },
    }),
  ]);
  const completedIds = new Set(completedRecords.map((r) => r.moduleContentId));
  const signedIds = new Set(signOffs.map((s) => s.moduleId));
  const sectionLabels = {
    subjects: t("sections.subjects"),
    mandatoryLearning: t("sections.mandatoryLearning"),
    practice: t("sections.practice"),
    assessment: t("sections.assessment"),
  };

  // Group by course; within a course, curriculum modules come first in
  // (level, order) sequence and legacy modules (no level) follow.
  type Mod = (typeof modules)[number];
  const byCourse = new Map<string, { name: string; modules: Mod[]; access: Map<string, ModuleState> }>();
  for (const mod of modules) {
    const group = byCourse.get(mod.courseId) ?? {
      name: mod.course.name,
      modules: [] as Mod[],
      access: new Map<string, ModuleState>(),
    };
    group.modules.push(mod);
    byCourse.set(mod.courseId, group);
  }
  for (const group of byCourse.values()) {
    group.modules.sort(
      (a, b) =>
        (a.level?.number ?? Infinity) - (b.level?.number ?? Infinity) || a.moduleOrder - b.moduleOrder
    );
    group.access = computeModuleAccess(
      group.modules.map((m) => ({
        id: m.id,
        levelNumber: m.level?.number ?? null,
        moduleOrder: m.moduleOrder,
        isGated: m.isGated,
      })),
      signedIds
    );
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
        {modules.some((m) => m.level) && (
          <p className="text-xs text-muted-foreground">
            {t("stages")}: {STAGES.join(" → ")}
          </p>
        )}
        {Array.from(byCourse.entries()).map(([courseId, { name, modules: mods, access }]) => {
          // Locked modules' lessons are hidden, so they don't count toward progress.
          const allContents = mods.filter((m) => access.get(m.id) !== "locked").flatMap((m) => m.contents);
          const completedCount = allContents.filter((c) => completedIds.has(c.id)).length;
          const pct =
            allContents.length > 0
              ? Math.round((completedCount / allContents.length) * 100)
              : 0;

          return (
            <div key={courseId} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-lg">{name}</h2>
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{allContents.length} completed · {pct}%
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />

              {mods.map((mod, i) => {
                const state = access.get(mod.id) ?? "unlocked";
                const prev = mods[i - 1];
                const level = mod.level && prev?.level?.number !== mod.level.number ? mod.level : null;
                const startsOtherModules = !mod.level && Boolean(prev?.level);

                const header = level ? (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {t("level", { number: level.number })}
                      </Badge>
                      {level.minAge && (
                        <Badge variant="outline" className="rounded-full">
                          {level.minAge}+
                        </Badge>
                      )}
                      <h3 className="font-heading text-base text-primary">{level.title}</h3>
                    </div>
                    {level.purpose && <p className="text-sm text-muted-foreground">{level.purpose}</p>}
                    {level.methodologyNote && (
                      <p className="flex gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
                        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        {level.methodologyNote}
                      </p>
                    )}
                  </div>
                ) : startsOtherModules ? (
                  <h3 className="mt-2 font-heading text-base text-primary">{t("otherModules")}</h3>
                ) : null;

                if (state === "locked") {
                  return (
                    <div key={mod.id} className="flex flex-col gap-3">
                      {header}
                      <Card className="border-dashed border-border/80 bg-muted/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Lock className="size-3.5" aria-hidden="true" />
                            {mod.code && <span className="font-mono text-xs">{mod.code}</span>}
                            {mod.title}
                          </CardTitle>
                          <CardDescription className="text-xs">{t("lockedHint")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ModuleSections module={mod} labels={sectionLabels} only={["subjects"]} />
                        </CardContent>
                      </Card>
                    </div>
                  );
                }

                const modCompleted = mod.contents.filter((c) => completedIds.has(c.id)).length;
                const modPct =
                  mod.contents.length > 0
                    ? Math.round((modCompleted / mod.contents.length) * 100)
                    : 0;

                return (
                  <div key={mod.id} className="flex flex-col gap-3">
                    {header}
                    <Card className="border-border/80">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-sm font-semibold">
                            <Layers className="me-1.5 inline size-3.5" />
                            {mod.code ? (
                              <span className="me-1.5 font-mono text-xs text-muted-foreground">{mod.code}</span>
                            ) : (
                              <>{mod.moduleOrder}. </>
                            )}
                            {mod.title}
                          </CardTitle>
                          <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            {state === "completed" && (
                              <Badge variant="secondary" className="rounded-full text-[10px]">
                                <CheckCircle2 className="me-1 size-3" aria-hidden="true" />
                                {t("signedOff")}
                              </Badge>
                            )}
                            {modPct}%
                          </span>
                        </div>
                        {mod.description && (
                          <CardDescription className="text-xs">{mod.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        {mod.level && (
                          <div className="mb-2">
                            <ModuleSections module={mod} labels={sectionLabels} />
                          </div>
                        )}
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
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
