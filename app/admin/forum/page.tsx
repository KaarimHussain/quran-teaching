import { Megaphone, Lock, LockOpen, Trash2, RotateCcw } from "lucide-react";
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
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatRelativeTime } from "@/lib/format";
import { toggleForumPostLocked, toggleForumPostRemoved } from "./actions";

export default async function AdminForumPage() {
  const currentUser = await requireCurrentUser();

  const posts = await prisma.forumPost.findMany({
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
    },
  });

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title="Forum Moderation"
      description="Review recent posts and moderate the community forum."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>{posts.length} most recent posts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col gap-2 rounded-xl border border-border p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Megaphone className="size-3.5" />
                  </span>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="text-sm font-medium leading-tight">{post.title}</span>
                    <span className="text-xs text-muted-foreground">
                      by {post.author.name} · {post.course?.name ?? "General"} ·{" "}
                      {formatRelativeTime(post.createdAt)}
                    </span>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{post.body}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {post.isLocked && (
                      <Badge variant="secondary" className="rounded-full">Locked</Badge>
                    )}
                    {post.isRemoved && (
                      <Badge variant="destructive" className="rounded-full">Removed</Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <form action={toggleForumPostLocked}>
                    <input type="hidden" name="postId" value={post.id} />
                    <Button type="submit" size="sm" variant="outline" className="rounded-full">
                      {post.isLocked ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
                      {post.isLocked ? "Unlock" : "Lock"}
                    </Button>
                  </form>
                  <form action={toggleForumPostRemoved}>
                    <input type="hidden" name="postId" value={post.id} />
                    <Button type="submit" size="sm" variant={post.isRemoved ? "outline" : "destructive"} className="rounded-full">
                      {post.isRemoved ? <RotateCcw className="size-3.5" /> : <Trash2 className="size-3.5" />}
                      {post.isRemoved ? "Restore" : "Remove"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <Megaphone className="size-6" />
                <span className="text-sm">No forum posts yet.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
