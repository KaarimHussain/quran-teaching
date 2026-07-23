import { FileText, Video, Headphones, Library, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
import { getTeacherCourseIds } from "@/lib/teacher";
import { deleteResource } from "./actions";
import { UploadResourceForm } from "./upload-resource-form";

type ResourceType = "PDF" | "VIDEO" | "AUDIO";

const typeIcon: Record<ResourceType, typeof FileText> = {
  PDF: FileText,
  VIDEO: Video,
  AUDIO: Headphones,
};

const typeLabel: Record<ResourceType, string> = {
  PDF: "Document",
  VIDEO: "Video",
  AUDIO: "Audio",
};

const typeColor: Record<ResourceType, string> = {
  PDF: "bg-primary/10 text-primary",
  VIDEO: "bg-accent/20 text-accent-foreground",
  AUDIO: "bg-chart-4/10 text-chart-4",
};

export default async function TeacherResourcesPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.teacher");
  const courseIds = await getTeacherCourseIds(currentUser.id);

  const [courses, resources] = await Promise.all([
    prisma.course.findMany({
      where: { id: { in: courseIds } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.resource.findMany({
      where: { uploadedByUserId: currentUser.id },
      orderBy: { createdAt: "desc" },
      include: { course: { select: { name: true } } },
    }),
  ]);

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("resources")}
      description={t("resourcesDesc")}
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("resourcesPage.uploadResource")}</CardTitle>
            <CardDescription>{t("resourcesPage.uploadResourceDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadResourceForm courses={courses} />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="size-4" /> {t("resourcesPage.yourLibrary")}
            </CardTitle>
            <CardDescription>
              {resources.length === 0 ? t("resourcesPage.nothingUploaded") : t("resourcesPage.resourceCount", { count: resources.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => {
                const Icon = typeIcon[resource.type];
                return (
                  <div key={resource.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${typeColor[resource.type]}`}>
                        <Icon className="size-5" />
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium leading-tight">{resource.title}</span>
                        <span className="text-xs text-muted-foreground">{resource.course?.name ?? t("resourcesPage.general")}</span>
                      </div>
                    </div>
                    {resource.description && (
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full">
                        {resource.type === "PDF" ? t("resourcesPage.document") : resource.type === "VIDEO" ? t("resourcesPage.video") : t("resourcesPage.audio")}
                      </Badge>
                      <form action={deleteResource}>
                        <input type="hidden" name="id" value={resource.id} />
                        <Button type="submit" size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-3.5" /> {t("resourcesPage.remove")}
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>

            {resources.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("resourcesPage.uploadFirstResource")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
