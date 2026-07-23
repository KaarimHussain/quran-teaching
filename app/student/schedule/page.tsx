import {
  Video,
  Clock,
  User,
  CalendarPlus,
  BookOpenText,
  Mic,
  Brain,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const weekDays = [
  {
    day: "Mon",
    date: "Jun 8",
    isToday: false,
    classes: [
      { course: "Nazra Quran", icon: BookOpenText, time: "4:00 PM", type: "One-to-One" },
    ],
  },
  {
    day: "Tue",
    date: "Jun 9",
    isToday: false,
    classes: [],
  },
  {
    day: "Wed",
    date: "Jun 10",
    isToday: false,
    classes: [
      { course: "Tajweed", icon: Mic, time: "5:00 PM", type: "Group" },
    ],
  },
  {
    day: "Thu",
    date: "Jun 11",
    isToday: false,
    classes: [
      { course: "Hifz-ul-Quran", icon: Brain, time: "7:00 PM", type: "Group" },
    ],
  },
  {
    day: "Fri",
    date: "Jun 12",
    isToday: false,
    classes: [],
  },
  {
    day: "Sat",
    date: "Jun 13",
    isToday: true,
    classes: [
      { course: "Nazra Quran", icon: BookOpenText, time: "10:00 AM", type: "One-to-One" },
      { course: "Tajweed", icon: Mic, time: "5:00 PM", type: "Group" },
    ],
  },
  {
    day: "Sun",
    date: "Jun 14",
    isToday: false,
    classes: [
      { course: "Hifz-ul-Quran", icon: Brain, time: "11:00 AM", type: "Group" },
    ],
  },
];

const upcomingClasses = [
  {
    course: "Nazra Quran",
    icon: BookOpenText,
    teacher: "Sister Amina Siddiqui",
    time: "Today, 10:00 AM – 10:30 AM",
    type: "One-to-One",
    joinable: true,
  },
  {
    course: "Tajweed",
    icon: Mic,
    teacher: "Ustadh Ahmad Raza",
    time: "Today, 5:00 PM – 6:00 PM",
    type: "Group",
    joinable: false,
  },
  {
    course: "Hifz-ul-Quran",
    icon: Brain,
    teacher: "Ustadh Tariq Mehmood",
    time: "Tomorrow, 11:00 AM – 12:00 PM",
    type: "Group",
    joinable: false,
  },
];

const typeVariant: Record<string, "secondary" | "outline"> = {
  "One-to-One": "secondary",
  Group: "outline",
};

export default async function StudentSchedulePage() {
  const t = await getTranslations("pages.student");

  return (
    <DashboardShell
      role="student"
      roleLabel="Student"
      userName="Yusuf Khan"
      title={t("schedule")}
      description={t("scheduleDesc")}
    >
      <div className="flex flex-col gap-6">
        {/* Weekly view */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>June 8 – June 14</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {weekDays.map((day) => (
                <div
                  key={day.day}
                  className={`flex flex-col gap-2 rounded-lg border p-3 ${
                    day.isToday ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day.day}</span>
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                  {day.isToday && (
                    <Badge className="w-fit rounded-full">Today</Badge>
                  )}
                  {day.classes.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No classes</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {day.classes.map((session) => (
                        <div
                          key={session.course + session.time}
                          className="flex flex-col gap-1 rounded-md bg-muted px-2 py-1.5"
                        >
                          <span className="flex items-center gap-1.5 text-xs font-medium">
                            <session.icon className="size-3.5 text-primary" />
                            {session.course}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" /> {session.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming classes */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>Your next scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcomingClasses.map((session) => (
              <div
                key={session.course + session.time}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <session.icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{session.course}</span>
                      <Badge variant={typeVariant[session.type]} className="rounded-full">
                        {session.type}
                      </Badge>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="size-3.5" /> {session.teacher}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" /> {session.time}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <CalendarPlus className="size-3.5" /> Remind Me
                  </Button>
                  <Button size="sm" disabled={!session.joinable}>
                    <Video className="size-3.5" /> Join Class
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
