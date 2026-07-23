import Link from "next/link";
import {
  BookOpenCheck,
  Video,
  Languages,
  LineChart,
  Users,
  Library,
  Moon,
  GraduationCap,
  Heart,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const features = [
  {
    icon: Video,
    title: "Live Video Classes",
    description:
      "Join one-to-one or group classes with verified teachers, with audio-only and low-bandwidth modes for slow connections.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Languages,
    title: "English, Urdu & Arabic",
    description:
      "Learn in your preferred language with full right-to-left support for Urdu and Arabic readers.",
    accent: "bg-secondary/40 text-secondary-foreground",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    description:
      "Follow your journey through Nazra, Hifz, Tajweed, and Tafseer with clear timelines and pathway levels.",
    accent: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: Users,
    title: "Parent Dashboard",
    description:
      "Parents can view attendance, progress, and homework for each linked child, and message teachers directly.",
    accent: "bg-chart-4/10 text-chart-4",
  },
  {
    icon: Library,
    title: "Resource Library",
    description:
      "Browse PDFs, videos, and audio lessons with subtitles, filterable by course and language for self-study.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Moon,
    title: "Built for Accessibility",
    description:
      "Mobile-friendly design, dark mode, low-bandwidth mode, and audio-only classes for low-end devices.",
    accent: "bg-secondary/40 text-secondary-foreground",
  },
];

const courses = [
  { name: "Nazra Quran", level: "Beginner" },
  { name: "Tajweed", level: "Intermediate" },
  { name: "Hifz-ul-Quran", level: "Advanced" },
  { name: "Tafseer", level: "Intermediate" },
  { name: "Salah (Prayer Practice)", level: "Beginner" },
  { name: "Islamic Studies", level: "All Levels" },
];

const roles = [
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Enroll in courses, attend live classes, submit homework, and earn certificates as you progress.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: BookOpenCheck,
    title: "Teachers",
    description:
      "Set your availability, run live classes, grade assignments, and track each student's progress — volunteers welcome.",
    accent: "bg-secondary/40 text-secondary-foreground",
  },
  {
    icon: Heart,
    title: "Parents",
    description:
      "Stay connected to your child's learning with attendance, progress updates, and direct teacher messaging.",
    accent: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: ShieldCheck,
    title: "Super Admins",
    description:
      "Oversee courses, schedules, teacher verification, and community moderation across the whole platform.",
    accent: "bg-chart-4/10 text-chart-4",
  },
];

const stats = [
  { value: "6", label: "Core Courses" },
  { value: "3", label: "Languages" },
  { value: "4", label: "Roles Supported" },
  { value: "Free", label: "Cost to Students" },
];

const whyItems = [
  "No fees, no subscriptions — ever",
  "Verified volunteer & professional teachers",
  "Structured pathways from Beginner to Advanced",
  "Available in English, Urdu, and Arabic",
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Background layers */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/25 via-background to-background"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 0%, oklch(0.865 0.19 119 / 0.18) 0%, transparent 60%)",
            }}
          />
          {/* Faint dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle, oklch(0.34 0.055 165 / 0.12) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
            }}
          />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 sm:py-32">
            <Badge
              variant="secondary"
              className="h-auto rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
            >
              100% Free &middot; English &middot; Urdu &middot; Arabic
            </Badge>

            <h1 className="max-w-3xl font-heading text-4xl leading-tight text-primary sm:text-5xl md:text-6xl">
              A Peaceful Place to{" "}
              <span className="relative whitespace-nowrap">
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 h-3 rounded-full bg-secondary/40"
                />
                <span className="relative">Learn the Quran</span>
              </span>
            </h1>

            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Free Quranic education for children, adults, and new Muslims &mdash; live
              classes, structured pathways, and a caring community, all in one place.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 shadow-md">
                <Link href="/register">
                  Start Learning Free <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>

            {/* Stats */}
            <dl className="mt-4 grid w-full max-w-2xl grid-cols-2 divide-x divide-border border-x border-border sm:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center gap-1 px-6 py-4 ${i === 0 ? "" : ""}`}
                >
                  <dt className="font-heading text-3xl text-primary sm:text-4xl">
                    {stat.value}
                  </dt>
                  <dd className="text-xs text-muted-foreground sm:text-sm">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Features ── */}
        <section
          id="features"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3 text-center">
            <Badge className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Why Quran Learning
            </Badge>
            <h2 className="font-heading text-3xl text-primary sm:text-4xl">
              Everything You Need to Learn the Quran
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Designed from the ground up to be accessible to students everywhere, on any
              device and any connection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Top accent line */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/40 via-secondary/60 to-transparent" />
                <CardHeader>
                  <span
                    className={`mb-3 flex size-11 items-center justify-center rounded-xl ${feature.accent} transition-transform duration-200 group-hover:scale-110`}
                    aria-hidden="true"
                  >
                    <feature.icon className="size-5" />
                  </span>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Courses ── */}
        <section className="bg-muted/40 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                >
                  Course Catalog
                </Badge>
                <h2 className="font-heading text-3xl text-primary sm:text-4xl">
                  Structured Learning Pathways
                </h2>
              </div>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/courses">
                  View All Courses <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.name}
                  size="sm"
                  className="group border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
                >
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-9 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                        aria-hidden="true"
                      >
                        <BookOpenCheck className="size-4" />
                      </span>
                      <span className="font-medium">{course.name}</span>
                    </div>
                    <Badge variant="outline" className="shrink-0 rounded-full">
                      {course.level}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why us (checklist) ── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
            <div className="flex flex-col gap-4 lg:w-1/2">
              <Badge
                variant="secondary"
                className="w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              >
                Our Promise
              </Badge>
              <h2 className="font-heading text-3xl text-primary sm:text-4xl">
                Why Thousands Choose Us
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                We built this platform on the principle that Quranic education should be
                accessible to every Muslim, regardless of their location or income.
              </p>
            </div>
            <ul className="flex flex-col gap-4 lg:w-1/2" role="list">
              {whyItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm text-foreground/80 sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Roles ── */}
        <section
          id="about"
          className="bg-muted/40 py-16 sm:py-24"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
              <Badge className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Built for Everyone
              </Badge>
              <h2 className="font-heading text-3xl text-primary sm:text-4xl">
                One Platform, Four Roles
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Whether you&apos;re here to learn, teach, support your children, or manage
                the platform — Quran Learning has a place for you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {roles.map((role) => (
                <Card
                  key={role.title}
                  className="group border-border/80 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <CardHeader className="flex flex-col items-center">
                    <span
                      className={`mb-3 flex size-12 items-center justify-center rounded-full ${role.accent} transition-transform duration-200 group-hover:scale-110`}
                      aria-hidden="true"
                    >
                      <role.icon className="size-6" />
                    </span>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:pb-28">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            {/* CTA background decoration */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, oklch(1 0 0 / 0.07) 0%, transparent 40%),
                  radial-gradient(circle at 80% 50%, oklch(1 0 0 / 0.05) 0%, transparent 40%)
                `,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -end-20 -top-20 size-64 rounded-full border border-primary-foreground/10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -start-16 size-48 rounded-full border border-primary-foreground/10"
            />

            <div className="relative flex flex-col items-center gap-6">
              <h2 className="font-heading text-3xl sm:text-4xl">
                Ready to Begin Your Journey?
              </h2>
              <p className="max-w-xl text-sm text-primary-foreground/75 sm:text-base">
                Create your free account today and join a global community of students,
                teachers, and families learning the Quran together.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8 shadow-md"
                >
                  <Link href="/register">
                    Create Free Account <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary-foreground/30 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/login">I Already Have an Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
