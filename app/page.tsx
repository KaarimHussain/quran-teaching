import Link from "next/link";
import {
  ArrowRight,
  Baby,
  CheckCircle2,
  Eye,
  HeartHandshake,
  Sprout,
  UserRound,
  Users,
  BookOpenCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Faq } from "@/components/marketing/faq";
import { STAGES } from "@/lib/curriculum/data";
import { CURRICULUM_TOTALS, TRACKS, levelRange } from "@/lib/curriculum/tracks";

// Built entirely from static curriculum data — no database access — so the
// landing page stays fast and keeps working even if the database is down.

type Step = { title: string; body: string };
type Card = { title: string; body: string };
type QA = { question: string; answer: string };

const LEARNER_ICONS = [Baby, UserRound, Sprout, Eye];

export default async function Home() {
  const t = await getTranslations("marketing");
  const steps = t.raw("landing.howItWorks.steps") as Step[];
  const trust = t.raw("landing.hero.trust") as string[];
  const learners = t.raw("landing.learners.items") as Card[];
  const faq = t.raw("landing.faq.items") as QA[];

  const stats = [
    { value: String(CURRICULUM_TOTALS.tracks), label: t("landing.path.stats.tracks") },
    { value: String(CURRICULUM_TOTALS.levels), label: t("landing.path.stats.levels") },
    { value: String(CURRICULUM_TOTALS.modules), label: t("landing.path.stats.modules") },
    { value: t("landing.path.freeValue"), label: t("landing.path.stats.free") },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* 1. Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/25 via-background to-background">
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28">
            <Badge variant="secondary" className="h-auto rounded-full px-4 py-1.5 text-sm font-semibold">
              {t("landing.hero.badge")}
            </Badge>
            <h1 className="max-w-4xl font-heading text-4xl leading-tight text-primary sm:text-5xl md:text-6xl">
              {t("landing.hero.title")}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-foreground sm:text-xl">
              {t("landing.hero.subtitle")}
            </p>
            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg shadow-md">
                <Link href="/register">
                  {t("cta.primary")} <ArrowRight className="size-5 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full px-8 text-lg">
                <Link href="/courses">{t("cta.secondary")}</Link>
              </Button>
            </div>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {trust.map((item) => (
                <li key={item} className="flex items-center gap-2 text-base font-medium text-foreground">
                  <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2. How it works */}
        <section
          id="how-it-works"
          aria-labelledby="how-it-works-title"
          className="scroll-mt-24 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <SectionHeading
            id="how-it-works-title"
            eyebrow={t("landing.howItWorks.eyebrow")}
            title={t("landing.howItWorks.title")}
            intro={t("landing.howItWorks.intro")}
          />
          <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-7">
                <span
                  className="flex size-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="font-sans text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. Learning path */}
        <section aria-labelledby="path-title" className="bg-muted/50 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <SectionHeading
              id="path-title"
              eyebrow={t("landing.path.eyebrow")}
              title={t("landing.path.title")}
              intro={t("landing.path.intro")}
            />
            <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STAGES.map((stage, i) => (
                <li key={stage} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6">
                  <span className="text-base font-semibold text-primary">{i + 1}</span>
                  <h3 className="font-sans text-xl font-semibold text-foreground">{stage}</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {t(`landing.path.stages.${stage}`)}
                  </p>
                </li>
              ))}
            </ol>
            <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1 rounded-2xl bg-card p-5 text-center">
                  <dt className="order-2 text-base text-muted-foreground">{stat.label}</dt>
                  <dd className="order-1 font-heading text-4xl text-primary">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 4. Tracks */}
        <section aria-labelledby="tracks-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            id="tracks-title"
            eyebrow={t("landing.tracks.eyebrow")}
            title={t("landing.tracks.title")}
            intro={t("landing.tracks.intro")}
          />
          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((track) => {
              const range = levelRange(track.name);
              const Icon = track.icon;
              return (
                <li key={track.slug}>
                  <Link
                    href={`/courses#${track.slug}`}
                    className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-6" aria-hidden="true" />
                      </span>
                      <h3 className="font-sans text-xl font-semibold text-foreground">{track.name}</h3>
                    </div>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {t(`tracks.${track.messageKey}.audience`)}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="outline" className="rounded-full text-sm">
                        {range.first === range.last
                          ? t("courses.track.level", { number: range.first })
                          : t("landing.tracks.levelRange", { first: range.first, last: range.last })}
                      </Badge>
                      <span className="flex items-center gap-1 text-base font-semibold text-primary">
                        {t("landing.tracks.explore")}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 5. For every learner */}
        <section aria-labelledby="learners-title" className="bg-muted/50 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <SectionHeading
              id="learners-title"
              eyebrow={t("landing.learners.eyebrow")}
              title={t("landing.learners.title")}
            />
            <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {learners.map((item, i) => {
                const Icon = LEARNER_ICONS[i] ?? Users;
                return (
                  <li key={item.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary/50 text-secondary-foreground">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-sans text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">{item.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* 6. Parents & teachers */}
        <section aria-labelledby="pt-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            id="pt-title"
            eyebrow={t("landing.parentsTeachers.eyebrow")}
            title={t("landing.parentsTeachers.title")}
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-7">
              <HeartHandshake className="size-8 text-primary" aria-hidden="true" />
              <h3 className="font-sans text-xl font-semibold text-foreground">
                {t("landing.parentsTeachers.parents.title")}
              </h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("landing.parentsTeachers.parents.body")}
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-7">
              <BookOpenCheck className="size-8 text-primary" aria-hidden="true" />
              <h3 className="font-sans text-xl font-semibold text-foreground">
                {t("landing.parentsTeachers.teachers.title")}
              </h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("landing.parentsTeachers.teachers.body")}
              </p>
              <Button asChild variant="outline" className="mt-auto h-12 w-fit rounded-full px-6 text-base">
                <Link href="/register">{t("landing.parentsTeachers.teachers.cta")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <section aria-labelledby="faq-title" className="bg-muted/50 py-16 sm:py-24">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6">
            <SectionHeading id="faq-title" eyebrow={t("landing.faq.eyebrow")} title={t("landing.faq.title")} />
            <Faq items={faq} />
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:pb-24">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            <h2 className="font-heading text-3xl sm:text-4xl">{t("landing.final.title")}</h2>
            <p className="max-w-prose text-lg leading-relaxed">{t("landing.final.body")}</p>
            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="h-14 rounded-full px-8 text-lg shadow-md">
                <Link href="/register">{t("cta.primary")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-primary-foreground/60 bg-transparent px-8 text-lg text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/login">{t("cta.haveAccount")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
