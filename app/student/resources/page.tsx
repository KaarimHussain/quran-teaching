import { FileText, Video, Headphones, Download, Eye } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import type { ResourceType } from "@/lib/generated/prisma/client";

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

const langLabel: Record<string, string> = {
  EN: "English",
  UR: "اردو",
  AR: "العربية",
};

export default async function StudentResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const user = await requireCurrentUser();
  const t = await getTranslations("pages.student");
  const { lang } = await searchParams;

  const userLang = user.preferredLanguage ?? "EN";
  const filterLang = (lang === "EN" || lang === "UR" || lang === "AR") ? lang : userLang;

  const resources = await prisma.resource.findMany({
    where: { language: filterLang as "EN" | "UR" | "AR" },
    include: { course: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Group by course
  const courseNames = ["All", ...Array.from(new Set(resources.map((r) => r.course?.name ?? "General"))).sort()];

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("resources")}
      description={t("resourcesDesc")}
    >
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>{t("resourcesPage.library")}</CardTitle>
          <CardDescription>{t("resourcesPage.resourcesAvailable", { count: resources.length })}</CardDescription>

          {/* Language filter */}
          <div className="mt-2 flex flex-wrap gap-2">
            {(["EN", "UR", "AR"] as const).map((l) => (
              <a
                key={l}
                href={`?lang=${l}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  filterLang === l
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {langLabel[l]}
              </a>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="All">
            <TabsList className="flex-wrap">
              {courseNames.map((course) => (
                <TabsTrigger key={course} value={course}>
                  {course}
                </TabsTrigger>
              ))}
            </TabsList>

            {courseNames.map((course) => {
              const filtered =
                course === "All"
                  ? resources
                  : resources.filter((r) => (r.course?.name ?? "General") === course);

              return (
                <TabsContent key={course} value={course} className="mt-4">
                  {filtered.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      {t("resourcesPage.noResources")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filtered.map((resource) => {
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
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium leading-tight">{resource.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {resource.course?.name ?? t("resourcesPage.general")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="rounded-full">
                                {resource.type === "PDF" ? t("resourcesPage.document") : resource.type === "VIDEO" ? t("resourcesPage.video") : t("resourcesPage.audio")}
                              </Badge>
                              <Badge variant="outline" className="rounded-full text-[10px]">
                                {langLabel[resource.language]}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm" className="flex-1">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="size-3.5" /> {t("resourcesPage.view")}
                                </a>
                              </Button>
                              <Button asChild size="sm" className="flex-1">
                                <a href={resource.url} download>
                                  <Download className="size-3.5" /> {t("resourcesPage.download")}
                                </a>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
