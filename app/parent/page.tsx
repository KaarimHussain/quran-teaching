import Link from "next/link";
import {
  Heart,
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  Video,
  Clock,
  ArrowRight,
  MessagesSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const children = [
  {
    id: "yusuf",
    name: "Yusuf Khan",
    age: 10,
    attendance: 92,
    courses: [
      { name: "Nazra Quran", level: "Intermediate", progress: 70 },
      { name: "Tajweed", level: "Beginner", progress: 45 },
    ],
    upcomingClass: {
      title: "Tajweed — Group Class",
      time: "Today, 5:00 PM",
    },
    homework: [
      { title: "Surah Al-Fatiha Recitation", status: "Reviewed" },
      { title: "Ghunnah Practice Worksheet", status: "Submitted" },
    ],
  },
  {
    id: "maryam",
    name: "Maryam Khan",
    age: 8,
    attendance: 88,
    courses: [{ name: "Nazra Quran", level: "Beginner", progress: 30 }],
    upcomingClass: {
      title: "Nazra Quran — One-to-One",
      time: "Tomorrow, 3:00 PM",
    },
    homework: [{ title: "Arabic Alphabet Practice", status: "Not Submitted" }],
  },
];

const messages = [
  {
    teacher: "Ustadh Ahmad Raza",
    preview: "Yusuf is doing great with his Tajweed rules this week!",
    time: "2h ago",
  },
  {
    teacher: "Sister Amina Siddiqui",
    preview: "Maryam needs a bit more practice with the Arabic alphabet.",
    time: "1d ago",
  },
];

const statusVariant: Record<string, "secondary" | "outline"> = {
  Reviewed: "secondary",
  Submitted: "outline",
  "Not Submitted": "outline",
};

export default function ParentDashboardPage() {
  return (
    <DashboardShell
      role="parent"
      roleLabel="Parent"
      userName="Fatima Khan"
      title="Parent Dashboard"
      description="An overview of your children's learning journey."
    >
      <div className="flex flex-col gap-6">
        <Tabs defaultValue={children[0].id}>
          <TabsList>
            {children.map((child) => (
              <TabsTrigger key={child.id} value={child.id}>
                {child.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {children.map((child) => (
            <TabsContent key={child.id} value={child.id} className="mt-4">
              <div className="flex flex-col gap-6">
                {/* Child summary stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <Card size="sm" className="border-border/80">
                    <CardContent className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Heart className="size-5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-heading text-xl text-primary">{child.age}</span>
                        <span className="text-xs text-muted-foreground">Age (years)</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card size="sm" className="border-border/80">
                    <CardContent className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                        <CalendarCheck className="size-5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-heading text-xl text-primary">{child.attendance}%</span>
                        <span className="text-xs text-muted-foreground">Attendance</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card size="sm" className="border-border/80">
                    <CardContent className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/30 text-secondary-foreground">
                        <TrendingUp className="size-5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-heading text-xl text-primary">{child.courses.length}</span>
                        <span className="text-xs text-muted-foreground">Active Courses</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card size="sm" className="border-border/80">
                    <CardContent className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-chart-4/10 text-chart-4">
                        <ClipboardList className="size-5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-heading text-xl text-primary">{child.homework.length}</span>
                        <span className="text-xs text-muted-foreground">Homework Items</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left column */}
                  <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* Upcoming class */}
                    <Card className="border-border/80">
                      <CardHeader>
                        <CardTitle>Next Class</CardTitle>
                        <CardDescription>{child.name}&apos;s upcoming session</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                              <Video className="size-5" />
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium">{child.upcomingClass.title}</span>
                              <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="size-3.5" /> {child.upcomingClass.time}
                              </span>
                            </div>
                          </div>
                          <Button asChild variant="secondary" className="w-fit rounded-full">
                            <Link href="/parent/attendance">View Attendance</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Course progress */}
                    <Card className="border-border/80">
                      <CardHeader className="flex-row items-center justify-between">
                        <div>
                          <CardTitle>Course Progress</CardTitle>
                          <CardDescription>Enrolled courses and completion</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="rounded-full">
                          <Link href="/parent/progress">
                            Details <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        {child.courses.map((course) => (
                          <div key={course.name} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{course.name}</span>
                              <span className="text-muted-foreground">
                                {course.level} · {course.progress}%
                              </span>
                            </div>
                            <Progress value={course.progress} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right column */}
                  <div className="flex flex-col gap-6">
                    {/* Homework status */}
                    <Card className="border-border/80">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Homework</CardTitle>
                        <Button asChild variant="ghost" size="sm" className="rounded-full">
                          <Link href="/parent/homework">
                            All <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        {child.homework.map((item) => (
                          <div key={item.title} className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium leading-tight">{item.title}</span>
                            <Badge variant={statusVariant[item.status]} className="shrink-0 rounded-full">
                              {item.status}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Messages teaser */}
                    <Card className="border-border/80">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Messages</CardTitle>
                        <Button asChild variant="ghost" size="sm" className="rounded-full">
                          <Link href="/parent/messages">
                            Open <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        {messages.map((message) => (
                          <div key={message.teacher} className="flex items-start gap-2">
                            <Avatar size="sm">
                              <AvatarFallback>
                                {message.teacher
                                  .split(" ")
                                  .map((p) => p[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium leading-tight">{message.teacher}</span>
                              <span className="text-xs text-muted-foreground">{message.preview}</span>
                              <span className="mt-1 text-xs text-muted-foreground">{message.time}</span>
                            </div>
                          </div>
                        ))}
                        <Button asChild variant="secondary" className="mt-1 w-full rounded-full">
                          <Link href="/parent/messages">
                            <MessagesSquare className="size-4" /> Message Teacher
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardShell>
  );
}
