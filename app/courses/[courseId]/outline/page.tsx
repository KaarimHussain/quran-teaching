import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, HelpCircle, Info, PlayCircle, Volume2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { prisma } from "@/lib/db";
import { asStringList } from "@/lib/curriculum/lines";
import { trackFor } from "@/lib/curriculum/tracks";

const TYPE_ICON: Record<string, React.ReactNode> = {
  VIDEO: <PlayCircle className="size-5 shrink-0 text-primary" aria-hidden="true" />,
  TEXT: <FileText className="size-5 shrink-0 text-primary" aria-hidden="true" />,
  AUDIO: <Volume2 className="size-5 shrink-0 text-primary" aria-hidden="true" />,
  QUIZ: <HelpCircle className="size-5 shrink-0 text-primary" aria-hidden="true" />,
};

export async function generateStaticParams() {
  // Pre-rendering is best-effort: if the database is unreachable at build time,
  // fall back to rendering outlines on demand instead of failing the build.
  try {
    const courses = await prisma.course.findMany({ select: { id: true } });
    return courses.map((c) => ({ courseId: c.id }));
  } catch {
    return [];
  }
}

export default async function CourseOutlinePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const [t, course] = await Promise.all([
    getTranslations("marketing"),
    prisma.course.findUnique({
      where: { id: courseId, isActive: true },
      include: {
        levels: {
          orderBy: { number: "asc" },
          include: {
            modules: {
              orderBy: { moduleOrder: "asc" },
              select: { id: true, code: true, title: true, subjects: true, mandatoryLearning: true },
            },
          },
        },
        modules: {
          where: { levelId: null },
          orderBy: { moduleOrder: "asc" },
          include: { contents: { orderBy: { contentOrder: "asc" } } },
        },
      },
    }),
  ]);

  if (!course) notFound();

  const track = trackFor(course.name);
  const description = track ? t(`tracks.${track.messageKey}.description`) : course.description;
  const moduleCount =
    course.levels.reduce((n, l) => n + l.modules.length, 0) + course.modules.length;
  const progressSteps = t.raw("outline.progress.steps") as string[];
  const hasCurriculum = course.levels.length > 0;
  const isEmpty = !hasCurriculum && course.modules.length === 0;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
        <Button asChild variant="ghost" className="h-12 w-fit rounded-full px-4 text-base">
          <Link href="/courses">
            <ArrowLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
            {t("outline.back")}
          </Link>
        </Button>

        {/* Header */}
        <header className="flex flex-col gap-4">
          <h1 className="font-heading text-4xl leading-tight text-primary sm:text-5xl">{course.name}</h1>
          {description && (
            <p className="max-w-prose text-lg leading-relaxed text-foreground sm:text-xl">{description}</p>
          )}
          <ul className="flex flex-wrap gap-2">
            {hasCurriculum && (
              <li>
                <Badge variant="secondary" className="h-auto rounded-full px-3 py-1 text-base">
                  {t("outline.facts.levels", { count: course.levels.length })}
                </Badge>
              </li>
            )}
            {moduleCount > 0 && (
              <li>
                <Badge variant="secondary" className="h-auto rounded-full px-3 py-1 text-base">
                  {t("outline.facts.modules", { count: moduleCount })}
                </Badge>
              </li>
            )}
            <li>
              <Badge variant="secondary" className="h-auto rounded-full px-3 py-1 text-base">
                {t("outline.facts.free")}
              </Badge>
            </li>
          </ul>
        </header>

        {/* How you'll progress */}
        {hasCurriculum && (
          <section aria-labelledby="progress-title" className="rounded-3xl border border-border bg-muted/50 p-6 sm:p-8">
            <h2 id="progress-title" className="font-heading text-3xl text-primary">
              {t("outline.progress.title")}
            </h2>
            <ol className="mt-5 flex flex-col gap-4">
              {progressSteps.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="pt-1.5 text-lg leading-relaxed text-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {isEmpty && (
          <p className="rounded-2xl border border-border bg-card p-6 text-lg leading-relaxed text-foreground">
            {t("outline.preparing")}
          </p>
        )}

        {/* Curriculum levels */}
        {course.levels.map((level) => (
          <section key={level.id} aria-labelledby={`level-${level.number}`} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 border-b border-border pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="h-auto rounded-full px-3 py-1 text-base">
                  {t("outline.level", { number: level.number })}
                </Badge>
                {level.minAge && (
                  <Badge variant="outline" className="h-auto rounded-full px-3 py-1 text-base">
                    {t("outline.age", { age: level.minAge })}
                  </Badge>
                )}
              </div>
              <h2 id={`level-${level.number}`} className="font-heading text-3xl leading-tight text-primary">
                {level.title}
              </h2>
              {level.subtitle && <p className="text-lg text-muted-foreground">{level.subtitle}</p>}
              {level.purpose && (
                <p className="max-w-prose text-lg leading-relaxed text-foreground">{level.purpose}</p>
              )}
              {level.methodologyNote && (
                <p className="mt-1 flex gap-3 rounded-xl border border-accent/50 bg-accent/15 p-4 text-lg leading-relaxed text-foreground">
                  <Info className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                  {level.methodologyNote}
                </p>
              )}
            </div>

            <ol className="flex flex-col gap-4">
              {level.modules.map((mod) => {
                const subjects = asStringList(mod.subjects);
                const ableTo = asStringList(mod.mandatoryLearning);
                return (
                  <li key={mod.id} className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-sans text-xl font-semibold text-foreground">
                      {mod.code && <span className="text-base font-semibold text-primary">{mod.code}</span>}
                      {mod.title}
                    </h3>
                    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                      {subjects.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="font-sans text-lg font-semibold text-foreground">{t("outline.whatYouLearn")}</h4>
                          <ul className="flex list-disc flex-col gap-1 ps-6 text-lg leading-relaxed text-foreground marker:text-primary">
                            {subjects.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {ableTo.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="font-sans text-lg font-semibold text-foreground">{t("outline.ableTo")}</h4>
                          <ul className="flex flex-col gap-2 text-lg leading-relaxed text-foreground">
                            {ableTo.map((s) => (
                              <li key={s} className="flex gap-2">
                                <CheckCircle2 className="mt-1.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        {/* Modules outside the curriculum */}
        {course.modules.length > 0 && (
          <ol className="flex flex-col gap-4">
            {course.modules.map((mod) => (
              <li key={mod.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/50 px-6 py-4">
                  <h2 className="font-sans text-xl font-semibold text-foreground">{mod.title}</h2>
                  <span className="text-base text-muted-foreground">
                    {t("outline.lessons", { count: mod.contents.length })}
                  </span>
                </div>
                {mod.description && (
                  <p className="border-b border-border px-6 py-3 text-lg text-muted-foreground">{mod.description}</p>
                )}
                {mod.contents.length > 0 && (
                  <ol className="divide-y divide-border">
                    {mod.contents.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-3 px-6 py-4">
                        <span className="flex items-center gap-3 text-lg text-foreground">
                          {TYPE_ICON[c.contentType]}
                          {c.title}
                        </span>
                        {c.durationMins && (
                          <span className="shrink-0 text-base text-muted-foreground">{c.durationMins} min</span>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        )}

        {/* CTA */}
        <section className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground">
          <h2 className="font-heading text-3xl">{t("outline.ctaTitle", { course: course.name })}</h2>
          <Button asChild size="lg" variant="secondary" className="h-14 w-full rounded-full px-8 text-lg sm:w-auto">
            <Link href="/register">{t("cta.primary")}</Link>
          </Button>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
