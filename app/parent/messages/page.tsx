import { MessagesSquare, Bell, BookOpen, CheckCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
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
import { MessageForm } from "./message-form";
import { markNotificationRead, markAllNotificationsRead } from "./actions";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const notificationIcon: Record<string, React.ReactNode> = {
  CLASS_REMINDER: <span className="text-primary">📅</span>,
  HOMEWORK_ASSIGNED: <span className="text-accent-foreground">📝</span>,
  HOMEWORK_GRADED: <span className="text-chart-4">✅</span>,
  ATTENDANCE_RECORDED: <span className="text-secondary-foreground">📋</span>,
  CERTIFICATE_ISSUED: <span className="text-primary">🏆</span>,
  ANNOUNCEMENT: <span className="text-muted-foreground">📢</span>,
  MESSAGE: <span className="text-muted-foreground">💬</span>,
};

export default async function ParentMessagesPage() {
  const user = await requireCurrentUser();
  const t = await getTranslations("pages.parent");

  const [links, notifications, myPosts] = await Promise.all([
    prisma.parentStudentLink.findMany({
      where: { parentUserId: user.id },
      include: {
        student: {
          include: {
            enrollments: {
              where: { status: "ACTIVE" },
              include: {
                course: {
                  include: {
                    classSessions: {
                      include: { teacher: { select: { id: true, name: true, email: true } } },
                      orderBy: { scheduledStart: "desc" },
                      take: 3,
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.forumPost.findMany({
      where: { authorUserId: user.id, isRemoved: false },
      include: {
        replies: {
          where: { isRemoved: false },
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
        course: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Collect teachers and enrolled courses from all children
  const teacherMap = new Map<string, { name: string; email: string }>();
  const courseMap = new Map<string, { id: string; name: string }>();

  for (const { student } of links) {
    for (const enrollment of student.enrollments) {
      courseMap.set(enrollment.course.id, {
        id: enrollment.course.id,
        name: enrollment.course.name,
      });
      for (const session of enrollment.course.classSessions) {
        if (!teacherMap.has(session.teacher.id)) {
          teacherMap.set(session.teacher.id, {
            name: session.teacher.name,
            email: session.teacher.email,
          });
        }
      }
    }
  }

  const teachers = Array.from(teacherMap.entries()).map(([id, info]) => ({ id, ...info }));
  const courses = Array.from(courseMap.values());
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardShell
      role="parent"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("messages")}
      description={t("messagesDesc")}
    >
      <div className="flex flex-col gap-6">

        {/* Notifications */}
        <Card className="border-border/80">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-4" />
                {t("messagesPage.notifications")}
                {unreadCount > 0 && (
                  <Badge className="rounded-full text-xs">{t("messagesPage.unreadCount", { count: unreadCount })}</Badge>
                )}
              </CardTitle>
              <CardDescription>{t("messagesPage.notificationsDesc")}</CardDescription>
            </div>
            {unreadCount > 0 && (
              <form action={markAllNotificationsRead}>
                <SubmitButton size="sm" variant="outline" className="rounded-full" pendingLabel={t("messagesPage.marking")}>
                  <CheckCheck className="size-3.5" /> {t("messagesPage.markAllRead")}
                </SubmitButton>
              </form>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <Bell className="size-6" />
                <span className="text-sm">{t("messagesPage.noNotifications")}</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start justify-between gap-3 rounded-xl border p-3 transition-colors ${
                    notif.isRead ? "border-border bg-transparent" : "border-primary/20 bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-sm">
                      {notificationIcon[notif.type] ?? "📌"}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm">{notif.message}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <form action={markNotificationRead}>
                      <input type="hidden" name="notificationId" value={notif.id} />
                      <SubmitButton size="sm" variant="ghost" className="shrink-0 rounded-full text-xs" pendingLabel="…">
                        {t("messagesPage.dismiss")}
                      </SubmitButton>
                    </form>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Teachers contact directory */}
        {teachers.length > 0 && (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-4" /> {t("messagesPage.childrenTeachers")}
              </CardTitle>
              <CardDescription>{t("messagesPage.childrenTeachersDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Avatar>
                    <AvatarFallback className="bg-accent/20 text-accent-foreground">
                      {initials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{teacher.name}</span>
                    <span className="text-xs text-muted-foreground">{teacher.email}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Send a message */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessagesSquare className="size-4" /> {t("messagesPage.askQuestion")}
            </CardTitle>
            <CardDescription>
              {t("messagesPage.askQuestionDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MessageForm courses={courses} />
          </CardContent>
        </Card>

        {/* Existing posts + replies */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("messagesPage.yourConversations")}</CardTitle>
            <CardDescription>
              {myPosts.length === 0
                ? t("messagesPage.noPostsYet")
                : t("messagesPage.postCount", { count: myPosts.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {myPosts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <MessagesSquare className="size-6" />
                <span className="text-sm">{t("messagesPage.useFormAbove")}</span>
              </div>
            ) : (
              myPosts.map((post) => (
                <div key={post.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-tight">{post.title}</span>
                      {post.course && (
                        <Badge variant="outline" className="shrink-0 rounded-full text-xs">
                          {post.course.name}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>

                  {post.replies.length > 0 ? (
                    <div className="flex flex-col gap-2 border-t border-border pt-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("messagesPage.replyCount", { count: post.replies.length })}
                      </span>
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <Avatar size="sm">
                            <AvatarFallback className="text-[10px]">
                              {initials(reply.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium">{reply.author.name}</span>
                            <p className="text-xs text-muted-foreground">{reply.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground border-t border-border pt-2">
                      {t("messagesPage.noRepliesYet")}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
