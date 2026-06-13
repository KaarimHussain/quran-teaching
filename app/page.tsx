import Link from "next/link";
import {
  BookOpenCheck,
  Video,
  Languages,
  LineChart,
  Users,
  Library,
  Moon,
  Mic,
  GraduationCap,
  Heart,
  ShieldCheck,
  ArrowRight,
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
  },
  {
    icon: Languages,
    title: "English, Urdu & Arabic",
    description:
      "Learn in your preferred language with full right-to-left support for Urdu and Arabic readers.",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    description:
      "Follow your journey through Nazra, Hifz, Tajweed, and Tafseer with clear timelines and pathway levels.",
  },
  {
    icon: Users,
    title: "Parent Dashboard",
    description:
      "Parents can view attendance, progress, and homework for each linked child, and message teachers directly.",
  },
  {
    icon: Library,
    title: "Resource Library",
    description:
      "Browse PDFs, videos, and audio lessons with subtitles, filterable by course and language for self-study.",
  },
  {
    icon: Moon,
    title: "Built for Accessibility",
    description:
      "Mobile-friendly design, dark mode, low-bandwidth mode, and audio-only classes for low-end devices.",
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
  },
  {
    icon: BookOpenCheck,
    title: "Teachers",
    description:
      "Set your availability, run live classes, grade assignments, and track each student's progress — volunteers welcome.",
  },
  {
    icon: Heart,
    title: "Parents",
    description:
      "Stay connected to your child's learning with attendance, progress updates, and direct teacher messaging.",
  },
  {
    icon: ShieldCheck,
    title: "Super Admins",
    description:
      "Oversee courses, schedules, teacher verification, and community moderation across the whole platform.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-b from-secondary/20 via-background to-background">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28">
            <Badge variant="secondary" className="h-auto rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
              100% Free &middot; English &middot; Urdu &middot; Arabic
            </Badge>
            <h1 className="max-w-3xl font-heading text-4xl leading-tight text-primary sm:text-5xl md:text-6xl">
              A Peaceful Place to Pray, Learn, and Belong
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Free Quranic education for children, adults, and new Muslims &mdash;
              live classes, structured pathways, and a caring community, all in one
              place.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/register">
                  Start Learning Free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>

            <dl className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { value: "6", label: "Core Courses" },
                { value: "3", label: "Languages" },
                { value: "4", label: "Roles Supported" },
                { value: "0", label: "Cost to Students" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <dt className="font-heading text-2xl text-primary sm:text-3xl">{stat.value}</dt>
                  <dd className="text-xs text-muted-foreground sm:text-sm">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
            <Badge className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              Why Quran Learning
            </Badge>
            <h2 className="font-heading text-3xl text-primary sm:text-4xl">
              Everything You Need to Learn the Quran
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Designed from the ground up to be accessible to students everywhere,
              on any device and any connection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/80">
                <CardHeader>
                  <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
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

        {/* Courses */}
        <section className="bg-muted/50 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                  Course Catalog
                </Badge>
                <h2 className="font-heading text-3xl text-primary sm:text-4xl">
                  Structured Learning Pathways
                </h2>
              </div>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/courses">
                  View All Courses <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.name} size="sm" className="border-border/80">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
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

        {/* Roles */}
        <section id="about" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
            <Badge className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              Built for Everyone
            </Badge>
            <h2 className="font-heading text-3xl text-primary sm:text-4xl">
              One Platform, Four Roles
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Whether you&apos;re here to learn, teach, support your children, or
              manage the platform &mdash; Quran Learning has a place for you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => (
              <Card key={role.title} className="text-center border-border/80">
                <CardHeader className="flex flex-col items-center">
                  <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
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
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
            <h2 className="font-heading text-3xl sm:text-4xl">
              Ready to Begin Your Journey?
            </h2>
            <p className="max-w-xl text-sm text-primary-foreground/80 sm:text-base">
              Create your free account today and join a global community of
              students, teachers, and families learning the Quran together.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="rounded-full px-6">
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/login">I Already Have an Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
