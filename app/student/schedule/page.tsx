import { Video, Clock, User, CalendarPlus } from "lucide-react";
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
import { formatDate, formatDateTime } from "@/lib/format";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekBounds(now: Date) {
  const jsDay = now.getDay(); // 0=Sun
  const toMonday = jsDay === 0 ? -6 : 1 - jsDay;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + toMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return { weekStart, weekEnd };
}

export default async function StudentSchedulePage() {
  const user = await requireCurrentUser();
  const t = await getTranslations("pages.student");

  const now = new Date();
  const { weekStart, weekEnd } = getWeekBounds(now);
  const upcomingCutoff = new Date(now);
  upcomingCutoff.setDate(now.getDate() + 30);

  const participants = await prisma.classParticipant.findMany({
    where: {
      studentUserId: user.id,
      classSession: {
        status: { in: ["SCHEDULED", "LIVE"] },
        scheduledStart: { gte: weekStart, lte: upcomingCutoff },
      },
    },
    include: {
      classSession: {
        include: {
          course: { select: { name: true } },
          teacher: { select: { name: true } },
        },
      },
    },
    orderBy: { classSession: { scheduledStart: "asc" } },
  });

  const sessions = participants.map((p) => p.classSession);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const daySessions = sessions.filter((s) => {
      const start = new Date(s.scheduledStart);
      return start >= dayStart && start < dayEnd;
    });

    const isToday =
      dayStart.toDateString() === now.toDateString();

    return { dayName: DAY_NAMES[i], dayStart, daySessions, isToday };
  });

  const upcomingSessions = sessions
    .filter((s) => new Date(s.scheduledStart) >= now)
    .slice(0, 10);

  const weekLabel = `${formatDate(weekStart)} – ${formatDate(
    new Date(weekEnd.getTime() - 86400000)
  )}`;

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title={t("schedule")}
      description={t("scheduleDesc")}
    >
      <div className="flex flex-col gap-6">
        {/* Weekly calendar */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("schedulePage.thisWeek")}</CardTitle>
            <CardDescription>{weekLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {weekDays.map(({ dayName, dayStart, daySessions, isToday }) => (
                <div
                  key={dayName}
                  className={`flex flex-col gap-2 rounded-lg border p-3 ${
                    isToday
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dayName}</span>
                    <span className="text-xs text-muted-foreground">
                      {dayStart.getDate()}/{dayStart.getMonth() + 1}
                    </span>
                  </div>
                  {isToday && (
                    <Badge className="w-fit rounded-full">
                      {t("schedulePage.today")}
                    </Badge>
                  )}
                  {daySessions.length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {t("schedulePage.noClasses")}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {daySessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex flex-col gap-1 rounded-md bg-muted px-2 py-1.5"
                        >
                          <span className="text-xs font-medium leading-tight">
                            {session.course.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {new Date(session.scheduledStart).toLocaleTimeString(
                              "en",
                              { hour: "numeric", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming sessions */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t("schedulePage.upcomingClasses")}</CardTitle>
            <CardDescription>
              {t("schedulePage.nextScheduledSessions")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcomingSessions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
                <Clock className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("dash.noUpcomingSessions")}
                </p>
              </div>
            ) : (
              upcomingSessions.map((session) => {
                const isLive = session.status === "LIVE";
                const joinable =
                  isLive ||
                  new Date(session.scheduledStart).getTime() - now.getTime() <
                    15 * 60 * 1000;
                const typeLabel =
                  session.type === "ONE_TO_ONE"
                    ? t("dash.oneToOne")
                    : t("dash.group");

                return (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {session.course.name}
                          </span>
                          <Badge
                            variant={
                              session.type === "ONE_TO_ONE"
                                ? "secondary"
                                : "outline"
                            }
                            className="rounded-full"
                          >
                            {typeLabel}
                          </Badge>
                          {isLive && (
                            <Badge className="rounded-full bg-red-500 text-white">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="size-3.5" /> {session.teacher.name}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          {formatDateTime(new Date(session.scheduledStart))} –{" "}
                          {new Date(session.scheduledEnd).toLocaleTimeString(
                            "en",
                            { hour: "numeric", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <CalendarPlus className="size-3.5" />
                        {t("schedulePage.remindMe")}
                      </Button>
                      {joinable && session.joinUrl ? (
                        <Button size="sm" asChild>
                          <a
                            href={session.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Video className="size-3.5" />
                            {t("schedulePage.joinClass")}
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" disabled>
                          <Video className="size-3.5" />
                          {t("schedulePage.joinClass")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}