import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, PlayCircle, FileText, Volume2, HelpCircle, Lock, Unlock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { prisma } from "@/lib/db";

const TYPE_ICON: Record<string, React.ReactNode> = {
  VIDEO: <PlayCircle className="size-3.5 text-blue-500 shrink-0" />,
  TEXT: <FileText className="size-3.5 text-muted-foreground shrink-0" />,
  AUDIO: <Volume2 className="size-3.5 text-purple-500 shrink-0" />,
  QUIZ: <HelpCircle className="size-3.5 text-amber-500 shrink-0" />,
};

export async function generateStaticParams() {
  const courses = await prisma.course.findMany({ select: { id: true } });
  return courses.map((c) => ({ courseId: c.id }));
}

export default async function CourseOutlinePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId, isActive: true },
    include: {
      modules: {
        orderBy: { moduleOrder: "asc" },
        include: { contents: { orderBy: { contentOrder: "asc" } } },
      },
    },
  });

  if (!course) notFound();

  const totalContents = course.modules.reduce((s, m) => s + m.contents.length, 0);
  const totalMins = course.modules.reduce(
    (s, m) => s + m.contents.reduce((ms, c) => ms + (c.durationMins ?? 0), 0),
    0
  );

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href="/courses"><ArrowLeft className="size-4" /> Back to Courses</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl text-primary">{course.name}</h1>
          {course.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{course.modules.length} module{course.modules.length !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{totalContents} lesson{totalContents !== 1 ? "s" : ""}</span>
            {totalMins > 0 && (
              <>
                <span>·</span>
                <span><Clock className="size-3 inline mr-0.5" />{totalMins} min total</span>
              </>
            )}
          </div>
        </div>

        {course.modules.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Course content is being prepared. Check back soon.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {course.modules.map((mod) => (
            <div key={mod.id} className="rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between gap-3 bg-muted/50 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary shrink-0" />
                  <span className="font-semibold text-sm">
                    {mod.moduleOrder}. {mod.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {mod.isFree ? (
                      <><Unlock className="size-3 mr-1" />Free</>
                    ) : (
                      <><Lock className="size-3 mr-1" />Enrolled</>
                    )}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {mod.contents.length} lesson{mod.contents.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {mod.description && (
                <p className="px-5 py-2 text-xs text-muted-foreground border-b border-border">
                  {mod.description}
                </p>
              )}
              {mod.contents.length > 0 && (
                <ol className="divide-y divide-border">
                  {mod.contents.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="flex items-center gap-2">
                        {TYPE_ICON[c.contentType]}
                        <span className="text-sm">
                          {c.contentOrder}. {c.title}
                        </span>
                      </div>
                      {c.durationMins && (
                        <span className="text-xs text-muted-foreground shrink-0">{c.durationMins}m</span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 rounded-3xl bg-muted px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Ready to start learning{course.name ? ` ${course.name}` : ""}?
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/register">Enroll for Free</Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
