import { Bell, Users, MessageSquare } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
import { AnnouncementForm } from "./announcement-form";

export default async function AdminAnnouncementsPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.admin");

  const [totalUsers, announcementCount, recentAnnouncements] = await Promise.all([
    prisma.user.count(),
    prisma.notification.count({ where: { type: "ANNOUNCEMENT" } }),
    prisma.notification.groupBy({
      by: ["message"],
      where: { type: "ANNOUNCEMENT" },
      _count: { _all: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
      take: 10,
    }),
  ]);

  return (
    <DashboardShell
      role="admin"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("announcements")}
      description={t("announcementsDesc")}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{totalUsers.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{t("ann.totalRecipients")}</span>
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="border-border/80">
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                <Bell className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl text-primary">{announcementCount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{t("ann.notificationsSent")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("ann.sendAnnouncement")}</CardTitle>
            <CardDescription>{t("ann.sendAnnouncementDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnnouncementForm />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("ann.announcementHistory")}</CardTitle>
            <CardDescription>
              {recentAnnouncements.length === 0
                ? t("ann.noAnnouncementsYet")
                : `Last ${recentAnnouncements.length} unique message${recentAnnouncements.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentAnnouncements.map((ann) => (
              <div key={ann.message} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <MessageSquare className="size-3.5" />
                </span>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <p className="truncate text-sm">{ann.message}</p>
                  <span className="text-xs text-muted-foreground">
                    {t("ann.sentToUsers", { count: ann._count._all })} ·{" "}
                    {ann._max.createdAt ? formatRelativeTime(ann._max.createdAt) : "—"}
                  </span>
                </div>
              </div>
            ))}
            {recentAnnouncements.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <Bell className="size-6" />
                <span className="text-sm">{t("ann.noAnnouncementsYet")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
