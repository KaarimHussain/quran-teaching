import {
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpenText,
  Mic,
  Brain,
  Star,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WeeklyActivityChart } from "@/components/charts/weekly-activity-chart";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const stats = [
  { label: "Learning Streak", value: "12 days", icon: Flame, color: "bg-primary/10 text-primary" },
  { label: "Hours This Month", value: "18.5 hrs", icon: Clock, color: "bg-accent/20 text-accent-foreground" },
  { label: "Lessons Completed", value: "47", icon: CheckCircle2, color: "bg-secondary/30 text-secondary-foreground" },
  { label: "Overall Progress", value: "45%", icon: TrendingUp, color: "bg-chart-4/10 text-chart-4" },
];

const subjectProgress = [
  { subject: "Nazra Quran", icon: BookOpenText, percent: 70, color: "text-primary" },
  { subject: "Tajweed", icon: Mic, percent: 45, color: "text-accent-foreground" },
  { subject: "Hifz-ul-Quran", icon: Brain, percent: 20, color: "text-chart-4" },
];

const weeklyActivity = [
  { day: "Mon", minutes: 30 },
  { day: "Tue", minutes: 0 },
  { day: "Wed", minutes: 45 },
  { day: "Thu", minutes: 60 },
  { day: "Fri", minutes: 15 },
  { day: "Sat", minutes: 50 },
  { day: "Sun", minutes: 35 },
];

const achievements = [
  {
    title: "First Steps",
    description: "Completed your first lesson",
    icon: Star,
    earned: true,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "7-Day Streak",
    description: "Logged in and learned for 7 days in a row",
    icon: Flame,
    earned: true,
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    title: "Nazra Halfway",
    description: "Reached 50% completion in Nazra Quran",
    icon: BookOpenText,
    earned: true,
    color: "bg-secondary/30 text-secondary-foreground",
  },
  {
    title: "Tajweed Apprentice",
    description: "Completed Module 1 of Tajweed",
    icon: Mic,
    earned: true,
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    title: "First Surah Memorized",
    description: "Fully memorized Surah Al-Fatiha",
    icon: Brain,
    earned: true,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "30-Day Streak",
    description: "Logged in and learned for 30 days in a row",
    icon: Award,
    earned: false,
    color: "",
  },
];

export default function StudentProgressPage() {
  return (
    <DashboardShell
      role="student"
      roleLabel="Student"
      userName="Yusuf Khan"
      title="My Progress"
      description="A look at your learning journey and achievements."
    >
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} size="sm" className="border-border/80">
              <CardContent className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-lg ${stat.color}`}>
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
            {/* Subject progress */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>Progress by Subject</CardTitle>
                <CardDescription>How far along you are in each course</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {subjectProgress.map((item) => (
                  <div key={item.subject} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <item.icon className={`size-4 ${item.color}`} /> {item.subject}
                      </span>
                      <span className="text-muted-foreground">{item.percent}%</span>
                    </div>
                    <Progress value={item.percent} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly activity */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Minutes spent learning each day</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyActivityChart data={weeklyActivity} />
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Achievements */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Badges earned along the way</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {achievements.map((badge) => (
                  <div
                    key={badge.title}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center ${
                      badge.earned ? "border-border" : "border-dashed border-border opacity-50"
                    }`}
                  >
                    <span
                      className={`flex size-10 items-center justify-center rounded-full ${
                        badge.earned ? badge.color : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {badge.earned ? <badge.icon className="size-5" /> : <Lock className="size-4" />}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium leading-tight">{badge.title}</span>
                      <span className="text-[11px] text-muted-foreground leading-tight">
                        {badge.description}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Encouragement */}
            <Card className="border-border/80 bg-primary text-primary-foreground">
              <CardContent className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Flame className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-sm">12-Day Streak!</span>
                  <span className="text-xs text-primary-foreground/70">
                    Keep going — you&apos;re building a great habit.
                  </span>
                </div>
                <Badge variant="secondary" className="ml-auto rounded-full">
                  +5 XP
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
