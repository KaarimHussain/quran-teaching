import Link from "next/link";
import {
  Users,
  CalendarDays,
  ClipboardCheck,
  Star,
  Video,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const stats = [
  { label: "Active Students", value: "24", icon: Users, color: "bg-primary/10 text-primary" },
  { label: "Classes This Week", value: "12", icon: CalendarDays, color: "bg-accent/20 text-accent-foreground" },
  { label: "Pending Grading", value: "5", icon: ClipboardCheck, color: "bg-secondary/30 text-secondary-foreground" },
  { label: "Average Rating", value: "4.9", icon: Star, color: "bg-chart-4/10 text-chart-4" },
];

const todaySchedule = [
  {
    title: "Tajweed — Group Class",
    students: "6 students",
    time: "5:00 PM – 6:00 PM",
    type: "Group",
  },
  {
    title: "Nazra Quran — One-to-One",
    students: "Yusuf Khan",
    time: "4:00 PM – 4:30 PM",
    type: "One-to-One",
  },
  {
    title: "Hifz-ul-Quran — Revision Circle",
    students: "4 students",
    time: "7:00 PM – 8:00 PM",
    type: "Group",
  },
];

const assignmentsToGrade = [
  {
    student: "Yusuf Khan",
    title: "Surah Al-Fatiha Recitation",
    course: "Nazra Quran",
    submitted: "2 hours ago",
  },
  {
    student: "Maryam Ali",
    title: "Ghunnah Practice Worksheet",
    course: "Tajweed",
    submitted: "5 hours ago",
  },
  {
    student: "Bilal Ahmed",
    title: "Memorize Ayah 1–5, Al-Baqarah",
    course: "Hifz-ul-Quran",
    submitted: "1 day ago",
  },
];

const students = [
  { name: "Yusuf Khan", course: "Nazra Quran", level: "Intermediate", progress: 70 },
  { name: "Maryam Ali", course: "Tajweed", level: "Beginner", progress: 45 },
  { name: "Bilal Ahmed", course: "Hifz-ul-Quran", level: "Beginner", progress: 20 },
  { name: "Sara Patel", course: "Nazra Quran", level: "Beginner", progress: 55 },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeacherDashboardPage() {
  return (
    <DashboardShell
      role="teacher"
      roleLabel="Teacher"
      userName="Ustadh Ahmad Raza"
      title="Teacher Dashboard"
      description="Here's what's happening with your classes today."
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
            {/* Today's schedule */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Today&apos;s Schedule</CardTitle>
                  <CardDescription>Your upcoming sessions</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/teacher/availability">
                    Manage Availability <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {todaySchedule.map((session) => (
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
                        <span className="text-sm text-muted-foreground">{session.students}</span>
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

            {/* Students roster */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>My Students</CardTitle>
                  <CardDescription>Progress across your courses</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/teacher/students">
                    View All <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {students.map((student) => (
                  <div
                    key={student.name}
                    className="flex items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <Avatar>
                      <AvatarFallback>{initials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">{student.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {student.course} · {student.level}
                      </span>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {student.progress}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Assignments to grade */}
            <Card className="border-border/80">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Assignments to Grade</CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/teacher/assignments">
                    All <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {assignmentsToGrade.map((item) => (
                  <div key={item.title + item.student} className="flex items-start gap-2">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <ClipboardCheck className="size-3.5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.student} · {item.course}
                      </span>
                      <span className="text-xs text-muted-foreground">Submitted {item.submitted}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Availability summary */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>This week&apos;s open slots</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Mon – Thu</span>
                  <span className="text-muted-foreground">4:00 PM – 8:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Friday</span>
                  <span className="text-muted-foreground">Unavailable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sat – Sun</span>
                  <span className="text-muted-foreground">10:00 AM – 2:00 PM</span>
                </div>
                <Button asChild variant="secondary" className="mt-2 w-full rounded-full">
                  <Link href="/teacher/availability">Update Availability</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Verification status */}
            <Card className="border-border/80 bg-primary text-primary-foreground">
              <CardContent className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/10">
                  <CheckCircle2 className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-sm">Verified Teacher</span>
                  <span className="text-xs text-primary-foreground/70">
                    Your credentials are approved
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
