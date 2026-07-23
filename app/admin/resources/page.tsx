import { FileText, Video, Headphones, Library, Trash2, Eye, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SubmitButton } from "@/components/ui/submit-button";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { formatDate } from "@/lib/format";
import type { ResourceType } from "@/lib/generated/prisma/client";
import { adminDeleteResource } from "./actions";

const typeIcon: Record<ResourceType, typeof FileText> = {
  PDF: FileText,
  VIDEO: Video,
  AUDIO: Headphones,
};

const typeColor: Record<ResourceType, string> = {
  PDF: "bg-primary/10 text-primary",
  VIDEO: "bg-accent/20 text-accent-foreground",
  AUDIO: "bg-chart-4/10 text-chart-4",
};

const langLabel: Record<string, string> = {
  EN: "English",
  UR: "اردو",
  AR: "العربية",
};

export default async function AdminResourcesPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { name: true } },
      uploadedBy: { select: { name: true } },
    },
  });

  const totalByType = {
    PDF: resources.filter((r) => r.type === "PDF").length,
    VIDEO: resources.filter((r) => r.type === "VIDEO").length,
    AUDIO: resources.filter((r) => r.type === "AUDIO").length,
  };

  const uniqueTeachers = new Set(resources.map((r) => r.uploadedByUserId)).size;

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("resources")}
      description={t("resourcesDesc")}
    >
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Library className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{resources.length}</span>
                <span className="text-xs text-muted-foreground">{t("resourcesPage.totalResources")}</span>
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{totalByType.PDF}</span>
                <span className="text-xs text-muted-foreground">{t("resourcesPage.documents")}</span>
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                <Video className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{totalByType.VIDEO}</span>
                <span className="text-xs text-muted-foreground">{t("resourcesPage.videos")}</span>
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-chart-4/10 text-chart-4">
                <Headphones className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{totalByType.AUDIO}</span>
                <span className="text-xs text-muted-foreground">{t("resourcesPage.audios")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resource list */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="size-4" /> {t("resourcesPage.allResources")}
            </CardTitle>
            <CardDescription>
              {resources.length === 0
                ? t("resourcesPage.noResourcesYet")
                : t("resourcesPage.resourceSummary", {
                    count: resources.length,
                    teachers: uniqueTeachers,
                  })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resources.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
                <Library className="size-6" />
                <span className="text-sm">{t("resourcesPage.noResourcesYet")}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => {
                  const Icon = typeIcon[resource.type];
                  return (
                    <div
                      key={resource.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${typeColor[resource.type]}`}>
                          <Icon className="size-5" />
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-sm font-medium leading-tight">
                            {resource.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {resource.course?.name ?? t("resourcesPage.general")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t("resourcesPage.uploadedBy")} {resource.uploadedBy.name}
                          </span>
                        </div>
                      </div>

                      {resource.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {resource.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="rounded-full text-xs">
                          {resource.type === "PDF"
                            ? t("resourcesPage.document")
                            : resource.type === "VIDEO"
                            ? t("resourcesPage.video")
                            : t("resourcesPage.audio")}
                        </Badge>
                        <Badge variant="outline" className="rounded-full text-[10px]">
                          {langLabel[resource.language]}
                        </Badge>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {formatDate(resource.createdAt)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                        >
                          <Eye className="size-3.5" /> {t("resourcesPage.view")}
                          <ExternalLink className="size-3" />
                        </a>
                        <form action={adminDeleteResource}>
                          <input type="hidden" name="id" value={resource.id} />
                          <SubmitButton
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            pendingLabel={t("resourcesPage.deleting")}
                          >
                            <Trash2 className="size-3.5" /> {t("resourcesPage.delete")}
                          </SubmitButton>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
