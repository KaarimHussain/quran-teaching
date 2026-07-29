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
import type { LucideIcon } from "lucide-react";
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
import { prisma } from "@/lib/db";

const courseIcons: Record<string, LucideIcon> = {
  "Nazra Quran": BookOpenText,
  Tajweed: Mic,
  "Hifz-ul-Quran": Brain,
  Tafseer: ScrollText,
  "Salah (Prayer Practice)": Sunrise,
  "Islamic Studies": Landmark,
};

const languages = ["English", "Urdu", "Arabic"];

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

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
          {courses.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No courses available yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const Icon = courseIcons[course.name] ?? BookOpenText;
                return (
                  <Card key={course.id} className="flex flex-col border-border/80">
                    <CardHeader>
                      <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      {course.description && (
                        <CardDescription className="text-sm leading-relaxed">
                          {course.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto flex flex-wrap gap-1.5">
                      {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                        <Badge key={level} variant="outline" className="rounded-full">
                          {level}
                        </Badge>
                      ))}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1 rounded-full">
                        <Link href={`/courses/${course.id}/outline`}>
                          View Outline
                        </Link>
                      </Button>
                      <Button asChild className="flex-1 rounded-full">
                        <Link href="/register">
                          Enroll Now <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
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
