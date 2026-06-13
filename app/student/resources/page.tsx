import {
  Search,
  FileText,
  Video,
  Headphones,
  Download,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

type Resource = {
  title: string;
  course: string;
  type: "pdf" | "video" | "audio";
  meta: string;
};

const resources: Resource[] = [
  { title: "Arabic Alphabet Chart", course: "Nazra Quran", type: "pdf", meta: "PDF · 1.2 MB" },
  { title: "Letter Tracing Worksheet", course: "Nazra Quran", type: "pdf", meta: "PDF · 850 KB" },
  { title: "Surah Al-Fatiha Recitation Audio", course: "Nazra Quran", type: "audio", meta: "Audio · 3:42" },
  { title: "Tajweed Rules Summary", course: "Tajweed", type: "pdf", meta: "PDF · 2.1 MB" },
  { title: "Makharij (Articulation Points) Guide", course: "Tajweed", type: "pdf", meta: "PDF · 1.8 MB" },
  { title: "Ghunnah Practice Audio", course: "Tajweed", type: "audio", meta: "Audio · 5:10" },
  { title: "Noon & Meem Rules — Explainer", course: "Tajweed", type: "video", meta: "Video · 8:24" },
  { title: "Al-Baqarah 1–20 Memorization Guide", course: "Hifz-ul-Quran", type: "pdf", meta: "PDF · 3.4 MB" },
  { title: "Surah Al-Fatiha Recitation (Slow)", course: "Hifz-ul-Quran", type: "audio", meta: "Audio · 4:05" },
  { title: "Daily Dua Booklet", course: "General", type: "pdf", meta: "PDF · 980 KB" },
  { title: "Islamic Calendar 2026", course: "General", type: "pdf", meta: "PDF · 620 KB" },
];

const courses = ["All", "Nazra Quran", "Tajweed", "Hifz-ul-Quran", "General"];

const typeIcon: Record<Resource["type"], typeof FileText> = {
  pdf: FileText,
  video: Video,
  audio: Headphones,
};

const typeLabel: Record<Resource["type"], string> = {
  pdf: "Document",
  video: "Video",
  audio: "Audio",
};

const typeColor: Record<Resource["type"], string> = {
  pdf: "bg-primary/10 text-primary",
  video: "bg-accent/20 text-accent-foreground",
  audio: "bg-chart-4/10 text-chart-4",
};

export default function StudentResourcesPage() {
  return (
    <DashboardShell
      role="student"
      roleLabel="Student"
      userName="Yusuf Khan"
      title="Resources"
      description="Worksheets, recordings, and guides to support your learning."
    >
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Resource Library</CardTitle>
          <CardDescription>{resources.length} resources available</CardDescription>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="All">
            <TabsList className="flex-wrap">
              {courses.map((course) => (
                <TabsTrigger key={course} value={course}>
                  {course}
                </TabsTrigger>
              ))}
            </TabsList>

            {courses.map((course) => {
              const filtered =
                course === "All" ? resources : resources.filter((r) => r.course === course);

              return (
                <TabsContent key={course} value={course} className="mt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((resource) => {
                      const Icon = typeIcon[resource.type];
                      return (
                        <div
                          key={resource.title}
                          className="flex flex-col gap-3 rounded-lg border border-border p-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${typeColor[resource.type]}`}>
                              <Icon className="size-5" />
                            </span>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium leading-tight">{resource.title}</span>
                              <span className="text-xs text-muted-foreground">{resource.course}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="rounded-full">
                              {typeLabel[resource.type]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{resource.meta}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="size-3.5" /> View
                            </Button>
                            <Button size="sm" className="flex-1">
                              <Download className="size-3.5" /> Download
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
