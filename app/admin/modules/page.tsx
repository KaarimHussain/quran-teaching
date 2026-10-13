import { Layers, PlayCircle, FileText, Volume2, HelpCircle, Lock, Unlock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { CreateModuleForm } from "./create-module-form";
import { AddContentForm } from "./add-content-form";
import { DeleteModuleButton, DeleteContentButton } from "./delete-buttons";

const TYPE_ICON: Record<string, React.ReactNode> = {
  VIDEO: <PlayCircle className="size-3.5" />,
  TEXT: <FileText className="size-3.5" />,
  AUDIO: <Volume2 className="size-3.5" />,
  QUIZ: <HelpCircle className="size-3.5" />,
};

export default async function AdminModulesPage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const [courses, modules] = await Promise.all([
    prisma.course.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.courseModule.findMany({
      orderBy: [{ courseId: "asc" }, { moduleOrder: "asc" }],
      include: {
        course: { select: { name: true } },
        contents: { orderBy: { contentOrder: "asc" } },
      },
    }),
  ]);

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Course Modules"
      description="Build self-paced asynchronous content for courses."
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>New Module</CardTitle>
            <CardDescription>Add a module to any active course.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateModuleForm courses={courses} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {modules.length === 0 && (
            <p className="text-sm text-muted-foreground">No modules yet.</p>
          )}
          {modules.map((mod) => (
            <Card key={mod.id} id={mod.id} className="scroll-mt-20 border-border/80">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <CardTitle className="text-base">
                      {mod.moduleOrder}. {mod.title}
                    </CardTitle>
                    <CardDescription>{mod.course.name}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={mod.isFree ? "secondary" : "outline"}>
                      {mod.isFree ? (
                        <><Unlock className="size-3 mr-1" />Free</>
                      ) : (
                        <><Lock className="size-3 mr-1" />Enrolled only</>
                      )}
                    </Badge>
                    <DeleteModuleButton moduleId={mod.id} />
                  </div>
                </div>
                {mod.description && (
                  <p className="text-xs text-muted-foreground">{mod.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {mod.contents.length > 0 && (
                  <ol className="flex flex-col gap-1.5">
                    {mod.contents.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {TYPE_ICON[c.contentType]}
                          <span>{c.contentOrder}. {c.title}</span>
                          <Badge variant="outline" className="text-xs">{c.contentType}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.durationMins && (
                            <span className="text-xs text-muted-foreground">{c.durationMins}m</span>
                          )}
                          <DeleteContentButton contentId={c.id} />
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                <AddContentForm moduleId={mod.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
