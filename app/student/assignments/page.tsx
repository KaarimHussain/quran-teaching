import {
  BookOpenText,
  Mic,
  Brain,
  ScrollText,
  Sunrise,
  Landmark,
  Calendar,
  CheckCircle2,
  FileClock,
  AlertCircle,
  MessageSquareQuote,
} from "lucide-react";
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
import { formatDate } from "@/lib/format";

const courseIcons: Record<string, typeof BookOpenText> = {
  "Nazra Quran": BookOpenText,
  Tajweed: Mic,
  "Hifz-ul-Quran": Brain,
  Tafseer: ScrollText,
  "Salah (Prayer Practice)": Sunrise,
  "Islamic Studies": Landmark,
};

const courseColors: Record<string, string> = {
  "Nazra Quran": "bg-primary/10 text-primary",
  Tajweed: "bg-accent/20 text-accent-foreground",
  "Hifz-ul-Quran": "bg-chart-4/10 text-chart-4",
  Tafseer: "bg-secondary/30 text-secondary-foreground",
  "Salah (Prayer Practice)": "bg-primary/10 text-primary",
  "Islamic Studies": "bg-accent/20 text-accent-foreground",
};

type DisplayStatus = "reviewed" | "submitted" | "pending" | "overdue";

const statusMeta: Record<
  DisplayStatus,
  {
    label: string;
    variant: "secondary" | "outline" | "destructive";
    icon: typeof CheckCircle2;
  }
> = {
  reviewed: { label: "Reviewed", variant: "secondary", icon: CheckCircle2 },
  submitted: { label: "Submitted", variant: "outline", icon: FileClock },
  pending: { label: "Not Submitted", variant: "outline", icon: FileClock },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertCircle },
};

const tabs = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "overdue", label: "Overdue" },
];

export default async function StudentAssignmentsPage() {
  const [user, t] = await Promise.all([
    requireCurrentUser(),
    getTranslations("pages.student"),
  ]);

  const enrolledCourseIds = (
    await prisma.enrollment.findMany({
      where: { studentUserId: user.id, status: "ACTIVE" },
      select: { courseId: true },
    })
  ).map((e) => e.courseId);

  const assignments = await prisma.assignment.findMany({
    where: { courseId: { in: enrolledCourseIds } },
    include: {
      course: true,
      submissions: { where: { studentUserId: user.id } },
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();

  const items = assignments.map((a) => {
    const sub = a.submissions[0];
    let status: DisplayStatus;
    if (!sub || sub.status === "NOT_SUBMITTED") {
      status = a.dueDate < now ? "overdue" : "pending";
    } else if (sub.status === "SUBMITTED") {
      status = "submitted";
    } else {
      status = "reviewed";
    }
    return { assignment: a, submission: sub, status };
  });

  const Icon = (courseName: string) =>
    courseIcons[courseName] ?? BookOpenText;

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      language={user.preferredLanguage as "EN" | "UR" | "AR"}
      title={t("assignments")}
      description={t("assignmentsDesc")}
    >
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Homework</CardTitle>
          <CardDescription>
            {items.length} assignments across your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => {
              const filtered =
                tab.value === "all"
                  ? items
                  : items.filter((i) => i.status === tab.value);

              return (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="mt-4"
                >
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
                      <CheckCircle2 className="size-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Nothing here — you&apos;re all caught up!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {filtered.map(({ assignment, submission, status }) => {
                        const meta = statusMeta[status];
                        const CourseIcon = Icon(assignment.course.name);
                        const colorClass =
                          courseColors[assignment.course.name] ??
                          "bg-primary/10 text-primary";

                        const dueLabel =
                          status === "reviewed" || status === "submitted"
                            ? `Submitted ${submission?.submittedAt ? formatDate(submission.submittedAt) : ""}`
                            : status === "overdue"
                              ? `Was due ${formatDate(assignment.dueDate)}`
                              : `Due ${formatDate(assignment.dueDate)}`;

                        return (
                          <Card key={assignment.id} className="border-border/80">
                            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-start gap-3">
                                <span
                                  className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                                >
                                  <CourseIcon className="size-5" />
                                </span>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium leading-tight">
                                      {assignment.title}
                                    </span>
                                    <Badge
                                      variant={meta.variant}
                                      className="rounded-full"
                                    >
                                      <meta.icon className="size-3" />{" "}
                                      {meta.label}
                                    </Badge>
                                    {submission?.grade && (
                                      <Badge
                                        variant="outline"
                                        className="rounded-full"
                                      >
                                        Grade: {submission.grade}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {assignment.course.name}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar className="size-3.5" /> {dueLabel}
                                  </span>
                                  {submission?.feedback && (
                                    <div className="mt-1 flex items-start gap-1.5 rounded-md bg-muted px-2.5 py-2 text-xs text-muted-foreground">
                                      <MessageSquareQuote className="mt-0.5 size-3.5 shrink-0" />
                                      {submission.feedback}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={
                                  status === "pending" || status === "overdue"
                                    ? "default"
                                    : "outline"
                                }
                                className="w-full sm:w-auto"
                              >
                                {status === "reviewed" && "View Feedback"}
                                {status === "submitted" && "View Submission"}
                                {(status === "pending" ||
                                  status === "overdue") &&
                                  "Submit Work"}
                              </Button>
                            </CardContent>
                          </Card>
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
