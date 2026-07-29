import Link from "next/link";
import { MessagesSquare, Lock, MessageSquare, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
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
import { getTeacherCourseIds } from "@/lib/teacher";
import { NewPostForm } from "./new-post-form";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function TeacherForumPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.teacher");
  const courseIds = await getTeacherCourseIds(currentUser.id);

  const [courses, posts] = await Promise.all([
    prisma.course.findMany({
      where: { id: { in: courseIds } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.forumPost.findMany({
      where: { isRemoved: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { name: true } },
        course: { select: { name: true } },
        _count: { select: { replies: true } },
      },
    }),
  ]);

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("forum")}
      description={t("forumDesc")}
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("forumPage.startDiscussion")}</CardTitle>
            <CardDescription>{t("forumPage.startDiscussionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <NewPostForm courses={courses} />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessagesSquare className="size-4" /> {t("forumPage.recentDiscussions")}
            </CardTitle>
            <CardDescription>{t("forumPage.activeThreads", { count: posts.length })}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/teacher/forum/${post.id}`}
                className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 hover:border-primary/30"
              >
                <Avatar>
                  <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.isLocked && <Lock className="size-3.5 text-muted-foreground" />}
                    <span className="text-sm font-medium leading-tight hover:text-primary transition-colors">
                      {post.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="rounded-full">
                      {post.course?.name ?? t("forumPage.generalDiscussion")}
                    </Badge>
                    <span>{t("forumPage.by")} {post.author.name}</span>
                    <span>· {formatRelativeTime(post.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.body}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="size-4" /> {post._count.replies}
                  </span>
                  <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}

            {posts.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("forumPage.noDiscussions")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
