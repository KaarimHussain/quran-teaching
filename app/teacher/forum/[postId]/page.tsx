import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, MessageSquare, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatRelativeTime } from "@/lib/format";
import { createForumReply } from "../actions";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const ROLE_BADGE: Record<string, string> = {
  TEACHER: "Teacher",
  SUPER_ADMIN: "Admin",
  STUDENT: "",
  PARENT: "Parent",
};

export default async function TeacherForumPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") throw new Error("Forbidden");

  const post = await prisma.forumPost.findUnique({
    where: { id: postId, isRemoved: false },
    include: {
      author: { select: { name: true, role: true } },
      course: { select: { name: true } },
      replies: {
        where: { isRemoved: false },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, role: true } } },
      },
    },
  });

  if (!post) notFound();

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title=""
      description=""
    >
      <div className="flex flex-col gap-6 max-w-3xl">
        {/* Back link */}
        <div>
          <Button variant="ghost" size="sm" asChild className="rounded-full -ml-2">
            <Link href="/teacher/forum">
              <ArrowLeft className="size-4" /> Back to Forum
            </Link>
          </Button>
        </div>

        {/* Original post */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {post.isLocked && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3" /> Locked
                  </span>
                )}
                <Badge variant="outline" className="rounded-full text-xs">
                  {post.course?.name ?? "General Discussion"}
                </Badge>
              </div>
              <h1 className="font-heading text-xl text-primary leading-snug">{post.title}</h1>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Avatar>
              <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{post.author.name}</span>
              {ROLE_BADGE[post.author.role] && (
                <span className="text-xs text-muted-foreground">{ROLE_BADGE[post.author.role]}</span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
            {post.body}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquare className="size-3.5" />
            {post.replies.length === 0
              ? "No replies yet"
              : `${post.replies.length} repl${post.replies.length === 1 ? "y" : "ies"}`}
          </div>
        </div>

        {/* Replies thread */}
        {post.replies.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Replies
            </h2>
            {post.replies.map((reply, i) => (
              <div key={reply.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Avatar size="sm">
                    <AvatarFallback>{initials(reply.author.name)}</AvatarFallback>
                  </Avatar>
                  {i < post.replies.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 pb-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold">{reply.author.name}</span>
                    {ROLE_BADGE[reply.author.role] && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        {ROLE_BADGE[reply.author.role]}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(reply.createdAt)}
                    </span>
                  </div>
                  <div className="rounded-xl rounded-tl-none border border-border bg-card px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {reply.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        {!post.isLocked && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2.5">
              <Avatar>
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">{user.name}</span>
            </div>
            <form action={createForumReply} className="flex flex-col gap-2">
              <input type="hidden" name="postId" value={post.id} />
              <textarea
                name="body"
                required
                rows={3}
                placeholder="Write your reply…"
                className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
              <div className="flex justify-end">
                <Button type="submit" className="rounded-full px-5">
                  <Send className="size-4" /> Post Reply
                </Button>
              </div>
            </form>
          </div>
        )}

        {post.isLocked && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <Lock className="size-4" />
            This thread is locked — no new replies can be added.
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
