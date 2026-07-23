import { MessagesSquare } from "lucide-react";
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
import { formatDate } from "@/lib/format";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default async function ParentMessagesPage() {
  const user = await requireCurrentUser();

  // Get teachers of children's courses
  const links = await prisma.parentStudentLink.findMany({
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
  });

  const teacherMap = new Map<string, { name: string; email: string }>();
  for (const { student } of links) {
    for (const enrollment of student.enrollments) {
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

  const myPosts = await prisma.forumPost.findMany({
    where: { authorUserId: user.id },
    include: {
      replies: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell
      role="parent"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      language={user.preferredLanguage as "EN" | "UR" | "AR"}
      title="Messages"
      description="Communication with your children's teachers."
    >
      <div className="flex flex-col gap-6">
        {teachers.length > 0 && (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Your Children&apos;s Teachers</CardTitle>
              <CardDescription>Teachers assigned to your children&apos;s enrolled courses</CardDescription>
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

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Forum Discussions</CardTitle>
            <CardDescription>Your posts and teacher replies from the community forum</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {myPosts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <MessagesSquare className="size-6" />
                <p className="text-sm">No posts yet. Use the community forum to ask questions.</p>
              </div>
            ) : (
              myPosts.map((post) => (
                <div key={post.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{post.title}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                  {post.replies.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-border pt-3">
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <Avatar size="sm">
                            <AvatarFallback className="text-[10px]">
                              {initials(reply.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">{reply.author.name}</span>
                            <span className="text-xs text-muted-foreground">{reply.body}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
