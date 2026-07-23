import { MessagesSquare, Lock, MessageSquare } from "lucide-react";
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
import { ReplyForm } from "./reply-form";

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
        replies: {
          where: { isRemoved: false },
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true } } },
        },
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
              <div key={post.id} className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {post.isLocked && <Lock className="size-3.5 text-muted-foreground" />}
                      <span className="text-sm font-medium leading-tight">{post.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="rounded-full">
                        {post.course?.name ?? t("forumPage.generalDiscussion")}
                      </Badge>
                      <span>{t("forumPage.by")} {post.author.name}</span>
                      <span>· {formatRelativeTime(post.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{post.body}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="size-4" /> {post.replies.length}
                  </div>
                </div>

                {post.replies.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-border pl-11 pt-2">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <Avatar size="sm">
                          <AvatarFallback>{initials(reply.author.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{reply.author.name}</span>
                          <span className="text-sm text-muted-foreground">{reply.body}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!post.isLocked && (
                  <div className="pl-11">
                    <ReplyForm postId={post.id} />
                  </div>
                )}
              </div>
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
