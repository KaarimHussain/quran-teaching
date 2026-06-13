import {
  Award,
  Download,
  Share2,
  BookOpenText,
  Mic,
  Brain,
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

const earnedCertificates = [
  {
    title: "Nazra Quran — Beginner",
    issued: "Issued June 1, 2026",
    icon: BookOpenText,
  },
];

const inProgressCertificates = [
  { course: "Nazra Quran — Intermediate", icon: BookOpenText, progress: 70 },
  { course: "Tajweed — Beginner", icon: Mic, progress: 45 },
  { course: "Hifz-ul-Quran — Beginner", icon: Brain, progress: 20 },
];

export default function StudentCertificatesPage() {
  return (
    <DashboardShell
      role="student"
      roleLabel="Student"
      userName="Yusuf Khan"
      title="Certificates"
      description="Celebrate your milestones and track what's next."
    >
      <div className="flex flex-col gap-6">
        {/* Featured certificate */}
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
                Nazra Quran — Beginner
              </h2>
              <p className="text-sm text-muted-foreground">
                Awarded to <span className="font-medium text-foreground">Yusuf Khan</span> on June 1, 2026
              </p>
            </div>
            <div className="flex gap-2">
              <Button>
                <Download className="size-4" /> Download PDF
              </Button>
              <Button variant="outline">
                <Share2 className="size-4" /> Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Earned certificates list */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Earned Certificates</CardTitle>
            <CardDescription>Your completed pathways</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {earnedCertificates.map((cert) => (
              <div
                key={cert.title}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <cert.icon className="size-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium">{cert.title}</span>
                    <span className="text-xs text-muted-foreground">{cert.issued}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="size-3.5" /> Download
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="size-3.5" /> Share
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* In-progress certificates */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
            <CardDescription>Keep learning to unlock these certificates</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {inProgressCertificates.map((cert) => (
              <div key={cert.course} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <cert.icon className="size-5" />
                    </span>
                    <span className="font-medium">{cert.course}</span>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    <Lock className="size-3" /> {cert.progress}%
                  </Badge>
                </div>
                <Progress value={cert.progress} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
