import { Megaphone, Lock, LockOpen, Trash2, RotateCcw, MessageSquare, ShieldAlert, Eye } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { toggleForumPostLocked, toggleForumPostRemoved } from "./actions";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AdminForumPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");

  const [posts, totalCount, lockedCount, removedCount] = await Promise.all([
    prisma.forumPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        body: true,
        isLocked: true,
        isRemoved: true,
        createdAt: true,
        author: { select: { name: true } },
        course: { select: { name: true } },
        _count: { select: { replies: true } },
      },
    }),
    prisma.forumPost.count(),
    prisma.forumPost.count({ where: { isLocked: true } }),
    prisma.forumPost.count({ where: { isRemoved: true } }),
  ]);

  const stats = [
    { label: t("forumPage.totalPosts"), value: totalCount, icon: MessageSquare, color: "bg-primary/10 text-primary" },
    { label: t("forumPage.visible"), value: totalCount - removedCount, icon: Eye, color: "bg-chart-4/10 text-chart-4" },
    { label: t("forumPage.locked"), value: lockedCount, icon: Lock, color: "bg-secondary/30 text-secondary-foreground" },
    { label: t("forumPage.removed"), value: removedCount, icon: ShieldAlert, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("forum")}
      description={t("forumDesc")}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} size="sm" className="border-border/80">
              <CardContent className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-xl text-primary">{stat.value.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("forumPage.recentPosts")}</CardTitle>
            <CardDescription>{t("forumPage.mostRecentPosts", { count: posts.length })}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col gap-2 rounded-xl border border-border p-3">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="text-sm font-medium leading-tight">{post.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {t("forumPage.by")} {post.author.name} · {post.course?.name ?? t("forumPage.general")} ·{" "}
                      {formatRelativeTime(post.createdAt)} ·{" "}
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="inline size-3" /> {post._count.replies}
                      </span>
                    </span>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{post.body}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {post.isLocked && (
                      <Badge variant="secondary" className="gap-1 rounded-full"><Lock className="size-3" /> {t("forumPage.locked")}</Badge>
                    )}
                    {post.isRemoved && (
                      <Badge variant="destructive" className="gap-1 rounded-full"><ShieldAlert className="size-3" /> {t("forumPage.removed")}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <form action={toggleForumPostLocked}>
                    <input type="hidden" name="postId" value={post.id} />
                    <SubmitButton
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      pendingLabel={post.isLocked ? t("forumPage.unlocking") : t("forumPage.locking")}
                    >
                      {post.isLocked ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
                      {post.isLocked ? t("forumPage.unlock") : t("forumPage.lock")}
                    </SubmitButton>
                  </form>
                  <form action={toggleForumPostRemoved}>
                    <input type="hidden" name="postId" value={post.id} />
                    <SubmitButton
                      size="sm"
                      variant={post.isRemoved ? "outline" : "destructive"}
                      className="rounded-full"
                      pendingLabel={post.isRemoved ? t("forumPage.restoring") : t("forumPage.removing")}
                    >
                      {post.isRemoved ? <RotateCcw className="size-3.5" /> : <Trash2 className="size-3.5" />}
                      {post.isRemoved ? t("forumPage.restore") : t("forumPage.remove")}
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <Megaphone className="size-6" />
                <span className="text-sm">{t("forumPage.noForumPosts")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
