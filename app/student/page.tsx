import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Award,
  CheckCircle2,
  Clock,
  Video,
  TrendingUp,
  ArrowRight,
  FileClock,
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
import { requireCurrentUser } from "@/lib/dal";
import { getTranslations } from "next-intl/server";

const stats = [
  { label: "Enrolled Courses", value: "3", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { label: "Upcoming Classes", value: "2", icon: CalendarDays, color: "bg-accent/20 text-accent-foreground" },
  { label: "Attendance Rate", value: "92%", icon: TrendingUp, color: "bg-secondary/30 text-secondary-foreground" },
  { label: "Certificates Earned", value: "1", icon: Award, color: "bg-chart-4/10 text-chart-4" },
];

const enrolledCourses = [
  { name: "Nazra Quran", level: "Intermediate", progress: 70 },
  { name: "Tajweed", level: "Beginner", progress: 45 },
  { name: "Hifz-ul-Quran", level: "Beginner", progress: 20 },
];

const upcomingClasses = [
  {
    title: "Tajweed — Group Class",
    teacher: "Ustadh Ahmad Raza",
    time: "Today, 5:00 PM",
    type: "Group",
  },
  {
    title: "Nazra Quran — One-to-One",
    teacher: "Sister Amina Siddiqui",
    time: "Tomorrow, 4:00 PM",
    type: "One-to-One",
  },
];

const progressBySubject = [
  { subject: "Nazra", percent: 70 },
  { subject: "Tajweed", percent: 45 },
  { subject: "Hifz", percent: 20 },
  { subject: "Tafseer", percent: 10 },
];

const homework = [
  {
    title: "Surah Al-Fatiha Recitation",
    course: "Nazra Quran",
    status: "Reviewed",
  },
  {
    title: "Ghunnah Practice Worksheet",
    course: "Tajweed",
    status: "Submitted",
  },
  {
    title: "Memorize Ayah 1–5, Al-Baqarah",
    course: "Hifz-ul-Quran",
    status: "Not Submitted",
  },
];

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Reviewed: "secondary",
  Submitted: "outline",
  "Not Submitted": "outline",
};

export default async function StudentDashboardPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.student");
  const firstName = currentUser.name.split(" ")[0];

  return (
    <DashboardShell
      role="student"
      roleLabel="Student"
      userName={currentUser.name}
      title={t("dashboard")}
      description={t("dashboardDesc", { name: firstName })}
    >
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} size="sm" className="border-border/80">
              <CardContent className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-xl text-primary">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Upcoming classes */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Classes</CardTitle>
                  <CardDescription>Your next scheduled sessions</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/student/schedule">
                    View Schedule <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {upcomingClasses.map((session) => (
                  <div
                    key={session.title}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                        <Video className="size-5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">{session.title}</span>
                        <span className="text-sm text-muted-foreground">{session.teacher}</span>
                        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3.5" /> {session.time}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit rounded-full">
                      {session.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* My courses */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>Continue where you left off</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/student/courses">
                    View All <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {enrolledCourses.map((course) => (
                  <div key={course.name} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-muted-foreground">{course.level} · {course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Progress by subject */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>Progress by Subject</CardTitle>
                <CardDescription>Across all enrolled courses</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {progressBySubject.map((item) => (
                  <div key={item.subject} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.subject}</span>
                      <span className="text-muted-foreground">{item.percent}%</span>
                    </div>
                    <Progress value={item.percent} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Homework */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Homework Status</CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/student/assignments">
                    All <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {homework.map((item) => (
                  <div key={item.title} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {item.status === "Reviewed" ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <FileClock className="size-3.5" />
                        )}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-tight">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.course}</span>
                      </div>
                    </div>
                    <Badge variant={statusVariant[item.status]} className="shrink-0 rounded-full">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Certificate teaser */}
            <Card className="border-border/80 bg-primary text-primary-foreground">
              <CardContent className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/10">
                  <Award className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-sm">Nazra Quran — Beginner</span>
                  <span className="text-xs text-primary-foreground/70">Certificate earned 🎉</span>
                </div>
                <Button asChild size="sm" variant="secondary" className="ml-auto rounded-full">
                  <Link href="/student/certificates">View</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
