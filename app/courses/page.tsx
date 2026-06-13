import Link from "next/link";
import {
  BookOpenText,
  Mic,
  Brain,
  ScrollText,
  Sunrise,
  Landmark,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const courses = [
  {
    name: "Nazra Quran",
    icon: BookOpenText,
    description:
      "Learn to read the Quran with correct pronunciation — from Arabic letters and connected reading through to fluent recitation.",
    levels: ["Beginner", "Intermediate"],
  },
  {
    name: "Tajweed",
    icon: Mic,
    description:
      "Master the rules of Quranic recitation — articulation points, elongation, and rhythm — to recite with beauty and precision.",
    levels: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    name: "Hifz-ul-Quran",
    icon: Brain,
    description:
      "Memorize the Holy Quran with a structured revision plan and one-to-one guidance from dedicated Hifz teachers.",
    levels: ["Intermediate", "Advanced"],
  },
  {
    name: "Tafseer",
    icon: ScrollText,
    description:
      "Understand the meaning, context, and lessons behind Quranic verses, connecting recitation with reflection.",
    levels: ["Intermediate", "Advanced"],
  },
  {
    name: "Salah (Prayer Practice)",
    icon: Sunrise,
    description:
      "Learn the correct method, timings, and spiritual essence of the five daily prayers, step by step.",
    levels: ["Beginner"],
  },
  {
    name: "Islamic Studies",
    icon: Landmark,
    description:
      "Explore the foundations of Islamic belief, history, ethics, and daily practice for learners of all ages.",
    levels: ["Beginner", "Intermediate", "Advanced"],
  },
];

const languages = ["English", "Urdu", "Arabic"];

export default function CoursesPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <section className="bg-gradient-to-b from-secondary/20 via-background to-background">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 sm:py-20">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
              Course Catalog
            </Badge>
            <h1 className="max-w-2xl font-heading text-4xl text-primary sm:text-5xl">
              Structured Learning Pathways
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Every course follows a Beginner &rarr; Intermediate &rarr; Advanced
              pathway and is available in English, Urdu, and Arabic.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {languages.map((lang) => (
                <Badge key={lang} variant="outline" className="rounded-full px-3 py-1">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.name} className="flex flex-col border-border/80">
                <CardHeader>
                  <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <course.icon className="size-5" />
                  </span>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-wrap gap-1.5">
                  {course.levels.map((level) => (
                    <Badge key={level} variant="outline" className="rounded-full">
                      {level}
                    </Badge>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full rounded-full">
                    <Link href="/register">
                      Enroll Now <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-muted px-6 py-12 text-center sm:px-12">
            <h2 className="font-heading text-2xl text-primary sm:text-3xl">
              Not sure where to start?
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Create a free account and our team will help place you on the
              right pathway based on your current level.
            </p>
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/register">
                Get Started <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
