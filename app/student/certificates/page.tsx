import {
  Award,
  Download,
  Share2,
  BookOpenText,
  Mic,
  Brain,
  ScrollText,
  Sunrise,
  Landmark,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatDate } from "@/lib/format";

const courseIcons: Record<string, typeof BookOpenText> = {
  "Nazra Quran": BookOpenText,
  Tajweed: Mic,
  "Hifz-ul-Quran": Brain,
  Tafseer: ScrollText,
  "Salah (Prayer Practice)": Sunrise,
  "Islamic Studies": Landmark,
};

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function StudentCertificatesPage() {
  const user = await requireCurrentUser();

  const [certificates, enrollments] = await Promise.all([
    prisma.certificate.findMany({
      where: { studentUserId: user.id },
      include: { course: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { studentUserId: user.id, status: "ACTIVE" },
      include: { course: true },
    }),
  ]);

  const certCourseIds = new Set(certificates.map((c) => c.courseId));
  const inProgressEnrollments = enrollments.filter(
    (e) => !certCourseIds.has(e.courseId)
  );

  const progressEntries = await prisma.progressEntry.findMany({
    where: {
      studentUserId: user.id,
      courseId: { in: inProgressEnrollments.map((e) => e.courseId) },
    },
    orderBy: { recordedAt: "desc" },
  });

  const latestProgressByCourse = new Map(
    progressEntries.map((p) => [p.courseId, p])
  );

  const featuredCert = certificates[0];

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      language={user.preferredLanguage as "EN" | "UR" | "AR"}
      title="Certificates"
      description="Celebrate your milestones and track what's next."
    >
      <div className="flex flex-col gap-6">
        {/* Featured certificate */}
        {featuredCert ? (
          <Card className="overflow-hidden border-2 border-accent/30">
            <CardContent className="flex flex-col items-center gap-4 bg-gradient-to-b from-accent/10 via-transparent to-transparent py-10 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                <Award className="size-8" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Certificate of Completion
                </p>
                <h2 className="font-heading text-2xl text-primary sm:text-3xl">
                  {featuredCert.course.name} —{" "}
                  {levelLabel[featuredCert.pathwayLevel] ??
                    featuredCert.pathwayLevel}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Awarded to{" "}
                  <span className="font-medium text-foreground">
                    {user.name}
                  </span>{" "}
                  on {formatDate(featuredCert.issuedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                {featuredCert.certificateUrl ? (
                  <Button asChild>
                    <a
                      href={featuredCert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="size-4" /> Download PDF
                    </a>
                  </Button>
                ) : (
                  <Button disabled>
                    <Download className="size-4" /> Download PDF
                  </Button>
                )}
                <Button variant="outline">
                  <Share2 className="size-4" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-2 border-dashed border-border">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Award className="size-8" />
              </span>
              <p className="text-sm text-muted-foreground">
                No certificates yet — keep learning to earn your first one!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Earned certificates list */}
        {certificates.length > 0 && (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Earned Certificates</CardTitle>
              <CardDescription>
                {certificates.length} completed pathway
                {certificates.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {certificates.map((cert) => {
                const CourseIcon =
                  courseIcons[cert.course.name] ?? BookOpenText;
                return (
                  <div
                    key={cert.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CourseIcon className="size-5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {cert.course.name} —{" "}
                          {levelLabel[cert.pathwayLevel] ?? cert.pathwayLevel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Issued {formatDate(cert.issuedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {cert.certificateUrl ? (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="size-3.5" /> Download
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Download className="size-3.5" /> Download
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Share2 className="size-3.5" /> Share
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* In-progress */}
        {inProgressEnrollments.length > 0 && (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
              <CardDescription>
                Keep learning to unlock these certificates
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {inProgressEnrollments.map((enrollment) => {
                const CourseIcon =
                  courseIcons[enrollment.course.name] ?? BookOpenText;
                const progress = latestProgressByCourse.get(enrollment.courseId);
                const pct = progress?.percentComplete ?? 0;
                return (
                  <div
                    key={enrollment.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <CourseIcon className="size-5" />
                        </span>
                        <span className="font-medium">
                          {enrollment.course.name} —{" "}
                          {levelLabel[enrollment.pathwayLevel] ??
                            enrollment.pathwayLevel}
                        </span>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        <Lock className="size-3" /> {pct}%
                      </Badge>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
