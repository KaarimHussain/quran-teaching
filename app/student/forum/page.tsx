import {
  Plus,
  Pin,
  MessageSquare,
  Megaphone,
  Globe,
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
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatRelativeTime } from "@/lib/format";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function StudentForumPage() {
  const user = await requireCurrentUser();

  const [posts, courses] = await Promise.all([
    prisma.forumPost.findMany({
      where: { isRemoved: false },
      include: {
        author: { select: { name: true } },
        course: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { isActive: true },
      select: { id: true, name: true, _count: { select: { forumPosts: { where: { isRemoved: false } } } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const globalCount = posts.filter((p) => !p.courseId).length;
  const pinnedPosts = posts.filter(
    (p) => p.isLocked
  );
  const regularPosts = posts.filter((p) => !p.isLocked);
  const sortedPosts = [...pinnedPosts, ...regularPosts];

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      language={user.preferredLanguage as "EN" | "UR" | "AR"}
      title="Community Forum"
      description="Ask questions, share progress, and learn together."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="border-border/80">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {posts.length} active discussions
              </p>
              <Button className="w-full sm:w-auto">
                <Plus className="size-4" /> New Discussion
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
              <CardDescription>{posts.length} active threads</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {sortedPosts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
                  <MessageSquare className="size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No discussions yet. Start the first one!
                  </p>
                </div>
              ) : (
                sortedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <Avatar>
                      <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {post.isLocked && (
                          <Pin className="size-3.5 text-primary" />
                        )}
                        <span className="text-sm font-medium leading-tight">
                          {post.title}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="rounded-full">
                          {post.course?.name ?? "General"}
                        </Badge>
                        <span>by {post.author.name}</span>
                        <span>· {formatRelativeTime(post.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="size-4" />{" "}
                      {post._count.replies}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Browse by course</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted">
                <span className="flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  General
                </span>
                <Badge variant="secondary" className="rounded-full">
                  {globalCount}
                </Badge>
              </div>
              {courses
                .filter((c) => c._count.forumPosts > 0)
                .map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <Megaphone className="size-4 text-accent-foreground" />
                      {course.name}
                    </span>
                    <Badge variant="secondary" className="rounded-full">
                      {course._count.forumPosts}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-primary text-primary-foreground">
            <CardContent className="flex flex-col gap-2">
              <span className="font-heading text-sm">Forum Guidelines</span>
              <p className="text-xs text-primary-foreground/70">
                Be respectful, stay on topic, and keep discussions beneficial
                for the whole community. Posts are moderated by our team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
