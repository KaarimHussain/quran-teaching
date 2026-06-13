import {
  BookOpenText,
  Mic,
  Brain,
  Calendar,
  CheckCircle2,
  FileClock,
  AlertCircle,
  MessageSquareQuote,
} from "lucide-react";
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

type Assignment = {
  title: string;
  course: string;
  icon: typeof BookOpenText;
  due: string;
  status: "reviewed" | "submitted" | "pending" | "overdue";
  grade?: string;
  feedback?: string;
};

const assignments: Assignment[] = [
  {
    title: "Surah Al-Fatiha Recitation",
    course: "Nazra Quran",
    icon: BookOpenText,
    due: "Submitted Jun 11",
    status: "reviewed",
    grade: "Excellent",
    feedback: "Great improvement in pronunciation — keep practicing the elongation on Ayah 4.",
  },
  {
    title: "Letter Recognition Practice",
    course: "Nazra Quran",
    icon: BookOpenText,
    due: "Submitted Jun 5",
    status: "reviewed",
    grade: "Good",
    feedback: "Well done! Review the joined forms of Ba and Ta before the next lesson.",
  },
  {
    title: "Ghunnah Practice Worksheet",
    course: "Tajweed",
    icon: Mic,
    due: "Submitted Jun 12",
    status: "submitted",
  },
  {
    title: "Tajweed Rules Quiz",
    course: "Tajweed",
    icon: Mic,
    due: "Was due Jun 10",
    status: "overdue",
  },
  {
    title: "Memorize Ayah 1–5, Al-Baqarah",
    course: "Hifz-ul-Quran",
    icon: Brain,
    due: "Due Jun 15",
    status: "pending",
  },
  {
    title: "Surah Al-Ikhlas Memorization",
    course: "Hifz-ul-Quran",
    icon: Brain,
    due: "Due Jun 18",
    status: "pending",
  },
];

const statusMeta: Record<
  Assignment["status"],
  { label: string; variant: "secondary" | "outline" | "destructive"; icon: typeof CheckCircle2 }
> = {
  reviewed: { label: "Reviewed", variant: "secondary", icon: CheckCircle2 },
  submitted: { label: "Submitted", variant: "outline", icon: FileClock },
  pending: { label: "Not Submitted", variant: "outline", icon: FileClock },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertCircle },
};

const courseColor: Record<string, string> = {
  "Nazra Quran": "bg-primary/10 text-primary",
  Tajweed: "bg-accent/20 text-accent-foreground",
  "Hifz-ul-Quran": "bg-chart-4/10 text-chart-4",
};

const tabs = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "overdue", label: "Overdue" },
];

function AssignmentCard({ item }: { item: Assignment }) {
  const meta = statusMeta[item.status];
  return (
    <Card className="border-border/80">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${courseColor[item.course] ?? "bg-primary/10 text-primary"}`}>
            <item.icon className="size-5" />
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium leading-tight">{item.title}</span>
              <Badge variant={meta.variant} className="rounded-full">
                <meta.icon className="size-3" /> {meta.label}
              </Badge>
              {item.grade && (
                <Badge variant="outline" className="rounded-full">
                  Grade: {item.grade}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{item.course}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" /> {item.due}
            </span>
            {item.feedback && (
              <div className="mt-1 flex items-start gap-1.5 rounded-md bg-muted px-2.5 py-2 text-xs text-muted-foreground">
                <MessageSquareQuote className="mt-0.5 size-3.5 shrink-0" />
                {item.feedback}
              </div>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant={item.status === "pending" || item.status === "overdue" ? "default" : "outline"}
          className="w-full sm:w-auto"
        >
          {item.status === "reviewed" && "View Feedback"}
          {item.status === "submitted" && "View Submission"}
          {(item.status === "pending" || item.status === "overdue") && "Submit Work"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function StudentAssignmentsPage() {
  return (
    <DashboardShell
      role="student"
      roleLabel="Student"
      userName="Yusuf Khan"
      title="Assignments"
      description="Track your homework, submissions, and feedback."
    >
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Homework</CardTitle>
          <CardDescription>{assignments.length} assignments across your courses</CardDescription>
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
                  ? assignments
                  : assignments.filter((item) => item.status === tab.value);

              return (
                <TabsContent key={tab.value} value={tab.value} className="mt-4">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
                      <CheckCircle2 className="size-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Nothing here — you&apos;re all caught up!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {filtered.map((item) => (
                        <AssignmentCard key={item.title} item={item} />
                      ))}
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
