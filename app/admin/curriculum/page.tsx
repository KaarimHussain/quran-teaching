import Link from "next/link";
import { ChevronDown, Layers, Lock, Unlock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { STAGES } from "@/lib/curriculum/data";
import { toLines } from "@/lib/curriculum/lines";
import { LevelNotesEditor, ModuleEditor } from "./module-editor";

export default async function AdminCurriculumPage() {
  const [user, t, levels] = await Promise.all([
    requireCurrentUser(),
    getTranslations("pages.admin.curriculum"),
    prisma.curriculumLevel.findMany({
      orderBy: { number: "asc" },
      include: {
        course: { select: { name: true } },
        modules: {
          orderBy: { moduleOrder: "asc" },
          include: { _count: { select: { contents: true } } },
        },
      },
    }),
  ]);
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  // Group levels under their track course, keeping level order.
  const byCourse = new Map<string, typeof levels>();
  for (const level of levels) {
    const group = byCourse.get(level.course.name) ?? [];
    group.push(level);
    byCourse.set(level.course.name, group);
  }

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("title")}
      description={t("description")}
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          {t("stages")}: {STAGES.join(" → ")}
        </p>

        {levels.length === 0 && (
          <Card className="border-border/80">
            <CardContent className="py-6 text-sm text-muted-foreground">{t("empty")}</CardContent>
          </Card>
        )}

        {[...byCourse.entries()].map(([courseName, courseLevels]) => (
          <section key={courseName} className="flex flex-col gap-3">
            <h2 className="font-heading text-xl text-primary">{courseName}</h2>

            {courseLevels.map((level) => (
              <Card key={level.id} className="border-border/80">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {t("level", { number: level.number })}
                    </Badge>
                    {level.minAge && (
                      <Badge variant="outline" className="rounded-full">
                        {level.minAge}+
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="font-heading text-lg">{level.title}</CardTitle>
                  {level.subtitle && <CardDescription>{level.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <details className="group rounded-lg border border-border/80 p-3">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium">
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                      {t("levelNotes")}
                    </summary>
                    <div className="mt-3">
                      <LevelNotesEditor
                        levelId={level.id}
                        purpose={level.purpose ?? ""}
                        methodologyNote={level.methodologyNote ?? ""}
                      />
                    </div>
                  </details>

                  {level.modules.map((mod) => (
                    <details key={mod.id} className="group rounded-lg border border-border/80 p-3">
                      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2">
                        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                        <span className="font-mono text-xs text-muted-foreground">{mod.code}</span>
                        <span className="text-sm font-medium">{mod.title}</span>
                        <span className="ms-auto flex items-center gap-2">
                          <Badge variant={mod.isGated ? "outline" : "secondary"} className="rounded-full">
                            {mod.isGated ? (
                              <><Lock className="me-1 size-3" aria-hidden="true" />{t("gated")}</>
                            ) : (
                              <><Unlock className="me-1 size-3" aria-hidden="true" />{t("open")}</>
                            )}
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            {t("lessons", { count: mod._count.contents })}
                          </Badge>
                        </span>
                      </summary>
                      <div className="mt-3 flex flex-col gap-3">
                        <Link
                          href={`/admin/modules#${mod.id}`}
                          className="inline-flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <Layers className="size-4" aria-hidden="true" />
                          {t("manageLessons")}
                        </Link>
                        <ModuleEditor
                          moduleId={mod.id}
                          isGated={mod.isGated}
                          values={{
                            subjects: toLines(mod.subjects),
                            mandatoryLearning: toLines(mod.mandatoryLearning),
                            practice: toLines(mod.practice),
                            assessment: toLines(mod.assessment),
                          }}
                        />
                      </div>
                    </details>
                  ))}
                </CardContent>
              </Card>
            ))}
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}
