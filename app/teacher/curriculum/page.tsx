import { CheckCircle2, Lock, Unlock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser, verifySession } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { teacherCoursesWhere } from "@/lib/teacher";
import { computeModuleAccess, type ModuleState } from "@/lib/curriculum/access";
import { asStringList } from "@/lib/curriculum/lines";
import { RevokeForm, SignOffForm } from "./signoff-button";

const STATE_BADGE: Record<ModuleState, { icon: typeof Lock; variant: "default" | "secondary" | "outline" }> = {
  completed: { icon: CheckCircle2, variant: "default" },
  unlocked: { icon: Unlock, variant: "secondary" },
  locked: { icon: Lock, variant: "outline" },
};

export default async function TeacherCurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const [{ userId: teacherId }, { student: requestedStudentId }] = await Promise.all([
    verifySession(),
    searchParams,
  ]);
  const teacherCourses = teacherCoursesWhere(teacherId);

  // The student comes from the URL, so their modules and sign-offs load in the
  // same batch; they are only shown if the student turns out to be one of ours.
  const [user, t, enrollments, modules, signOffs] = await Promise.all([
    requireCurrentUser(),
    getTranslations("pages.teacher.curriculum"),
    prisma.enrollment.findMany({
      where: { course: teacherCourses, status: "ACTIVE" },
      distinct: ["studentUserId"],
      select: { student: { select: { id: true, name: true } } },
    }),
    requestedStudentId
      ? prisma.courseModule.findMany({
          where: {
            levelId: { not: null },
            course: {
              ...teacherCourses,
              enrollments: { some: { studentUserId: requestedStudentId, status: "ACTIVE" } },
            },
          },
          include: {
            level: { select: { number: true, title: true } },
            course: { select: { id: true, name: true } },
          },
        })
      : Promise.resolve([]),
    requestedStudentId
      ? prisma.moduleSignOff.findMany({
          where: { studentUserId: requestedStudentId },
          select: { moduleId: true, notes: true, signedOffAt: true },
        })
      : Promise.resolve([]),
  ]);
  if (user.role !== "TEACHER") throw new Error("Forbidden");

  const students = enrollments.map((e) => e.student).sort((a, b) => a.name.localeCompare(b.name));
  const selected = students.find((s) => s.id === requestedStudentId);

  const signOffByModule = new Map(signOffs.map((s) => [s.moduleId, s]));
  const signedIds = new Set(signOffByModule.keys());

  // Group by course, then compute gating per course in curriculum order.
  const byCourse = new Map<string, { name: string; modules: (typeof modules)[number][] }>();
  for (const m of modules) {
    const group = byCourse.get(m.course.id) ?? { name: m.course.name, modules: [] };
    group.modules.push(m);
    byCourse.set(m.course.id, group);
  }
  const courses = [...byCourse.values()].map((group) => {
    const sorted = [...group.modules].sort(
      (a, b) => a.level!.number - b.level!.number || a.moduleOrder - b.moduleOrder
    );
    const access = computeModuleAccess(
      sorted.map((m) => ({
        id: m.id,
        levelNumber: m.level!.number,
        moduleOrder: m.moduleOrder,
        isGated: m.isGated,
      })),
      signedIds
    );
    return { name: group.name, modules: sorted, access };
  });

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("title")}
      description={t("description")}
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardContent>
            <form method="get" className="flex flex-wrap items-end gap-3">
              <label className="flex min-w-60 flex-1 flex-col gap-2 text-sm font-medium">
                {t("student")}
                <select
                  name="student"
                  defaultValue={selected?.id ?? ""}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">{t("chooseStudent")}</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" className="rounded-full">
                {t("view")}
              </Button>
            </form>
            {students.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">{t("noStudents")}</p>
            )}
          </CardContent>
        </Card>

        {selected && courses.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("noModules", { name: selected.name })}</p>
        )}

        {selected &&
          courses.map((course) => (
            <section key={course.name} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl text-primary">{course.name}</h2>
              {course.modules.map((m) => {
                const state = course.access.get(m.id) ?? "locked";
                const badge = STATE_BADGE[state];
                const signOff = signOffByModule.get(m.id);
                const mandatory = asStringList(m.mandatoryLearning);
                const assessment = asStringList(m.assessment);
                return (
                  <Card key={m.id} className="border-border/80">
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{m.code}</span>
                        <Badge variant={badge.variant} className="rounded-full">
                          <badge.icon className="me-1 size-3" aria-hidden="true" />
                          {t(`state.${state}`)}
                        </Badge>
                        {!m.isGated && (
                          <Badge variant="outline" className="rounded-full">
                            {t("notGated")}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">{m.title}</CardTitle>
                      <CardDescription>
                        {t("level", { number: m.level!.number, title: m.level!.title })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      {[
                        { label: t("mandatoryLearning"), items: mandatory },
                        { label: t("assessment"), items: assessment },
                      ]
                        .filter((section) => section.items.length > 0)
                        .map((section) => (
                          <div key={section.label} className="flex flex-col gap-1.5">
                            <h3 className="text-sm font-semibold">{section.label}</h3>
                            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                              {section.items.map((item) => (
                                <li key={item} className="flex gap-2">
                                  <span aria-hidden="true">☐</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                      {signOff && (
                        <p className="text-sm text-muted-foreground">
                          {t("signedOffOn", { date: signOff.signedOffAt.toLocaleDateString("en-GB") })}
                          {signOff.notes ? ` — ${signOff.notes}` : ""}
                        </p>
                      )}

                      {state === "unlocked" && <SignOffForm studentUserId={selected.id} moduleId={m.id} />}
                      {state === "completed" && <RevokeForm studentUserId={selected.id} moduleId={m.id} />}
                      {state === "locked" && (
                        <p className="text-sm text-muted-foreground">{t("lockedHint")}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          ))}
      </div>
    </DashboardShell>
  );
}
