import {
  Search,
  Plus,
  Pin,
  MessageSquare,
  Megaphone,
  Users,
  Mic,
  Brain,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const categories = [
  { name: "Announcements", icon: Megaphone, count: 3, color: "text-primary" },
  { name: "General Discussion", icon: Users, count: 142, color: "text-chart-4" },
  { name: "Tajweed Help", icon: Mic, count: 58, color: "text-accent-foreground" },
  { name: "Hifz Support", icon: Brain, count: 37, color: "text-primary" },
  { name: "Parents Corner", icon: Heart, count: 21, color: "text-chart-4" },
];

const threads = [
  {
    title: "Welcome to the new community forum!",
    category: "Announcements",
    author: "Admin Team",
    replies: 3,
    time: "2 days ago",
    pinned: true,
  },
  {
    title: "Tips for mastering the Ghunnah sound",
    category: "Tajweed Help",
    author: "Yusuf Khan",
    replies: 8,
    time: "5 hours ago",
    pinned: false,
  },
  {
    title: "Weekly memorization schedule template",
    category: "Hifz Support",
    author: "Ustadh Tariq Mehmood",
    replies: 15,
    time: "1 day ago",
    pinned: false,
  },
  {
    title: "Best time to start Hifz for young children?",
    category: "General Discussion",
    author: "Fatima Khan",
    replies: 12,
    time: "2 hours ago",
    pinned: false,
  },
  {
    title: "How do you stay motivated during exams + Quran study?",
    category: "General Discussion",
    author: "Maryam Ali",
    replies: 6,
    time: "3 days ago",
    pinned: false,
  },
  {
    title: "Recommended Tafseer books for beginners",
    category: "General Discussion",
    author: "Bilal Ahmed",
    replies: 4,
    time: "4 days ago",
    pinned: false,
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function StudentForumPage() {
  return (
    <DashboardShell
      role="student"
      roleLabel="Student"
      userName="Yusuf Khan"
      title="Community Forum"
      description="Ask questions, share progress, and learn together."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="border-border/80">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search discussions..." className="pl-9" />
              </div>
              <Button className="w-full sm:w-auto">
                <Plus className="size-4" /> New Discussion
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
              <CardDescription>{threads.length} active threads</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {threads.map((thread) => (
                <div
                  key={thread.title}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <Avatar>
                    <AvatarFallback>{initials(thread.author)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {thread.pinned && <Pin className="size-3.5 text-primary" />}
                      <span className="text-sm font-medium leading-tight">{thread.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="rounded-full">
                        {thread.category}
                      </Badge>
                      <span>by {thread.author}</span>
                      <span>· {thread.time}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="size-4" /> {thread.replies}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Browse by topic</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <category.icon className={`size-4 ${category.color}`} />
                    {category.name}
                  </span>
                  <Badge variant="secondary" className="rounded-full">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-primary text-primary-foreground">
            <CardContent className="flex flex-col gap-2">
              <span className="font-heading text-sm">Forum Guidelines</span>
              <p className="text-xs text-primary-foreground/70">
                Be respectful, stay on topic, and keep discussions beneficial for the
                whole community. Posts are moderated by our team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
