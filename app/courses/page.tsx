import Link from "next/link";
import { ArrowRight, BookOpenText, Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/marketing/section-heading";
import { prisma } from "@/lib/db";
import { partitionCourses } from "@/lib/curriculum/tracks";

type GuideItem = { prompt: string; slug: string };

export default async function CoursesPage() {
  const [t, courses] = await Promise.all([
    getTranslations("marketing"),
    prisma.course.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        levels: {
          orderBy: { number: "asc" },
          select: { number: true, title: true, subtitle: true, _count: { select: { modules: true } } },
        },
      },
    }),
  ]);

  // Curriculum tracks in learning order; every other active course goes under "Other courses".
  const { tracks, others } = partitionCourses(courses);

  // Guide items are keyed by track slug so translated prompts still match.
  const presentTracks = new Map(tracks.map(({ track }) => [track.slug, track]));
  const guide = (t.raw("courses.guide.items") as GuideItem[]).filter((g) => presentTracks.has(g.slug));

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="bg-gradient-to-b from-secondary/25 via-background to-background">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
            <Badge variant="secondary" className="h-auto rounded-full px-4 py-1.5 text-sm font-semibold">
              {t("courses.hero.eyebrow")}
            </Badge>
            <h1 className="max-w-3xl font-heading text-4xl leading-tight text-primary sm:text-5xl">
              {t("courses.hero.title")}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-foreground sm:text-xl">
              {t("courses.hero.intro")}
            </p>
            <Button asChild size="lg" className="h-14 w-full rounded-full px-8 text-lg shadow-md sm:w-auto">
              <Link href="/register">{t("cta.primary")}</Link>
            </Button>
          </div>
        </section>

        {courses.length === 0 && (
          <p className="mx-auto max-w-prose px-4 py-16 text-center text-lg text-muted-foreground">
            {t("courses.empty")}
          </p>
        )}

        {/* Where should I start? */}
        {guide.length > 0 && (
          <section aria-labelledby="guide-title" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <SectionHeading id="guide-title" title={t("courses.guide.title")} intro={t("courses.guide.intro")} />
            <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {guide.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`#${g.slug}`}
                    className="group flex h-full flex-col gap-4 rounded-2xl border-2 border-border bg-card p-6 transition-colors hover:border-primary"
                  >
                    <Compass className="size-7 text-primary" aria-hidden="true" />
                    <p className="text-xl font-semibold leading-snug text-foreground">“{g.prompt}”</p>
                    <span className="mt-auto flex items-center gap-1.5 text-base font-semibold text-primary">
                      {t("courses.guide.go", { track: t(`tracks.${presentTracks.get(g.slug)!.messageKey}.name`) })}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* The tracks */}
        {tracks.length > 0 && (
          <section className="bg-muted/50 py-12 sm:py-16">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6">
              {tracks.map(({ course, track }) => {
                const Icon = track.icon;
                const modules = course.levels.reduce((n, l) => n + l._count.modules, 0);
                return (
                  <article
                    key={course.id}
                    id={track.slug}
                    aria-labelledby={`${track.slug}-title`}
                    className="scroll-mt-28 grid grid-cols-1 gap-8 rounded-3xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-5"
                  >
                    <div className="flex flex-col gap-5 lg:col-span-3">
                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="size-7" aria-hidden="true" />
                        </span>
                        <h2 id={`${track.slug}-title`} className="min-w-0 font-heading text-3xl leading-tight text-primary [overflow-wrap:anywhere]">
                          {t(`tracks.${track.messageKey}.name`)}
                        </h2>
                      </div>
                      <p className="max-w-prose text-lg leading-relaxed text-foreground">
                        {t(`tracks.${track.messageKey}.description`)}
                      </p>
                      <div className="flex flex-col gap-1 rounded-2xl bg-secondary/25 p-5">
                        <p className="text-base font-semibold text-foreground">{t("courses.track.audience")}</p>
                        <p className="text-lg leading-relaxed text-foreground">
                          {t(`tracks.${track.messageKey}.audience`)}
                        </p>
                      </div>
                      <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="h-12 rounded-full px-6 text-base">
                          <Link href={`/courses/${course.id}/outline`}>{t("courses.track.outline")}</Link>
                        </Button>
                        <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base">
                          <Link href="/register">{t("cta.primary")}</Link>
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:col-span-2">
                      <h3 className="font-sans text-xl font-semibold text-foreground">{t("courses.track.inside")}</h3>
                      <ol className="flex flex-col gap-2">
                        {course.levels.map((level) => (
                          <li key={level.number} className="flex flex-col rounded-xl border border-border px-4 py-3">
                            <span className="text-base font-semibold text-primary">
                              {t("courses.track.level", { number: level.number })}
                            </span>
                            <span className="text-lg text-foreground">{level.title}</span>
                            {level.subtitle && (
                              <span className="text-base text-muted-foreground">{level.subtitle}</span>
                            )}
                          </li>
                        ))}
                      </ol>
                      {modules > 0 && (
                        <p className="text-base text-muted-foreground">
                          {t("courses.track.modules", { count: modules })}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Other courses */}
        {others.length > 0 && (
          <section aria-labelledby="other-title" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <SectionHeading id="other-title" title={t("courses.other.title")} intro={t("courses.other.intro")} align="start" />
            <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((course) => (
                <li key={course.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpenText className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-sans text-xl font-semibold text-foreground">{course.name}</h3>
                  {course.description && (
                    <p className="text-lg leading-relaxed text-muted-foreground">{course.description}</p>
                  )}
                  <div className="mt-auto flex flex-col gap-3">
                    <Button asChild variant="outline" className="h-12 rounded-full text-base">
                      <Link href={`/courses/${course.id}/outline`}>{t("courses.track.outline")}</Link>
                    </Button>
                    <Button asChild className="h-12 rounded-full text-base">
                      <Link href="/register">{t("cta.primary")}</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Not sure? */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
            <h2 className="font-heading text-3xl sm:text-4xl">{t("courses.notSure.title")}</h2>
            <p className="max-w-prose text-lg leading-relaxed">{t("courses.notSure.body")}</p>
            <Button asChild size="lg" variant="secondary" className="h-14 w-full rounded-full px-8 text-lg sm:w-auto">
              <Link href="/register">{t("cta.primary")}</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
