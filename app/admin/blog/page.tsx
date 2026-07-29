import { FileText, Eye, EyeOff, Trash2 } from "lucide-react";
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
import { CreatePostForm } from "./create-post-form";
import { toggleBlogPostPublished, deleteBlogPost } from "./actions";

const languageLabel: Record<string, string> = { EN: "English", UR: "Urdu", AR: "Arabic" };

export default async function AdminBlogPage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Blog"
      description="Publish articles and announcements visible on the public blog."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>New Post</CardTitle>
            <CardDescription>Write and publish a new blog article.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePostForm />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" /> All Posts
            </CardTitle>
            <CardDescription>
              {posts.length === 0 ? "No posts yet." : `${posts.length} post${posts.length === 1 ? "" : "s"} total.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium leading-tight">{post.title}</span>
                    <span className="text-xs text-muted-foreground">
                      by {post.author.name} · {languageLabel[post.language]} ·{" "}
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.excerpt && (
                      <span className="text-sm text-muted-foreground">{post.excerpt}</span>
                    )}
                  </div>
                  <Badge variant={post.isPublished ? "secondary" : "outline"} className="rounded-full shrink-0">
                    {post.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex gap-2 border-t border-border pt-2">
                  <form action={toggleBlogPostPublished}>
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="isPublished" value={String(post.isPublished)} />
                    <Button type="submit" variant="outline" size="sm" className="rounded-full gap-1">
                      {post.isPublished
                        ? <><EyeOff className="size-3.5" /> Unpublish</>
                        : <><Eye className="size-3.5" /> Publish</>}
                    </Button>
                  </form>
                  <form action={deleteBlogPost}>
                    <input type="hidden" name="id" value={post.id} />
                    <Button type="submit" variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive gap-1">
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-sm text-muted-foreground">No posts yet. Create your first article above.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
