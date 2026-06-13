import Link from "next/link";
import {
  BookOpenText,
  Mic,
  Brain,
  ScrollText,
  Sunrise,
  Landmark,
  PlayCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const enrolledCourses = [
  {
    name: "Nazra Quran",
    icon: BookOpenText,
    level: "Intermediate",
    teacher: "Sister Amina Siddiqui",
    progress: 70,
    nextLesson: "Module 3 · Basic Recitation, Lesson 2",
    modules: [
      {
        title: "Module 1 · Arabic Alphabet",
        status: "completed",
        lessons: [
          { title: "Letter Recognition", status: "completed" },
          { title: "Letter Forms & Joining", status: "completed" },
        ],
      },
      {
        title: "Module 2 · Connecting Letters",
        status: "completed",
        lessons: [
          { title: "Two-Letter Words", status: "completed" },
          { title: "Three-Letter Words", status: "completed" },
        ],
      },
      {
        title: "Module 3 · Basic Recitation",
        status: "in-progress",
        lessons: [
          { title: "Short Vowel Sounds", status: "completed" },
          { title: "Surah Al-Fatiha Recitation", status: "in-progress" },
          { title: "Surah Al-Ikhlas Recitation", status: "locked" },
        ],
      },
      {
        title: "Module 4 · Fluent Reading",
        status: "locked",
        lessons: [
          { title: "Connected Reading Practice", status: "locked" },
          { title: "Final Assessment", status: "locked" },
        ],
      },
    ],
  },
  {
    name: "Tajweed",
    icon: Mic,
    level: "Beginner",
    teacher: "Ustadh Ahmad Raza",
    progress: 45,
    nextLesson: "Module 2 · Noon & Meem Rules, Lesson 1",
    modules: [
      {
        title: "Module 1 · Introduction to Tajweed",
        status: "completed",
        lessons: [
          { title: "Why Tajweed Matters", status: "completed" },
          { title: "Articulation Points (Makharij)", status: "completed" },
        ],
      },
      {
        title: "Module 2 · Noon & Meem Rules",
        status: "in-progress",
        lessons: [
          { title: "Ghunnah Practice", status: "completed" },
          { title: "Ikhfa, Idgham & Iqlab", status: "in-progress" },
        ],
      },
      {
        title: "Module 3 · Madd Rules",
        status: "locked",
        lessons: [
          { title: "Natural & Connected Madd", status: "locked" },
          { title: "Obligatory & Permissible Madd", status: "locked" },
        ],
      },
    ],
  },
  {
    name: "Hifz-ul-Quran",
    icon: Brain,
    level: "Beginner",
    teacher: "Ustadh Tariq Mehmood",
    progress: 20,
    nextLesson: "Surah Al-Baqarah, Ayah 6-10",
    modules: [
      {
        title: "Surah Al-Fatiha",
        status: "completed",
        lessons: [
          { title: "Memorization", status: "completed" },
          { title: "Revision & Tajweed Check", status: "completed" },
        ],
      },
      {
        title: "Surah Al-Baqarah, Ayah 1-10",
        status: "in-progress",
        lessons: [
          { title: "Ayah 1-5 Memorization", status: "completed" },
          { title: "Ayah 6-10 Memorization", status: "in-progress" },
        ],
      },
      {
        title: "Surah Al-Baqarah, Ayah 11-20",
        status: "locked",
        lessons: [
          { title: "Ayah 11-15 Memorization", status: "locked" },
          { title: "Ayah 16-20 Memorization", status: "locked" },
        ],
      },
    ],
  },
];

const exploreCourses = [
  {
    name: "Tafseer",
    icon: ScrollText,
    description: "Understand the meaning and context behind Quranic verses.",
    levels: ["Intermediate", "Advanced"],
  },
  {
    name: "Salah (Prayer Practice)",
    icon: Sunrise,
    description: "Learn the correct method and timings of the five daily prayers.",
    levels: ["Beginner"],
  },
  {
    name: "Islamic Studies",
    icon: Landmark,
    description: "Explore the foundations of Islamic belief, history, and ethics.",
    levels: ["Beginner", "Intermediate", "Advanced"],
  },
];

function lessonIcon(status: string) {
  if (status === "completed") return <CheckCircle2 className="size-4 text-primary" />;
  if (status === "in-progress") return <PlayCircle className="size-4 text-secondary-foreground" />;
  return <Lock className="size-4 text-muted-foreground" />;
}

const moduleStatusLabel: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  locked: "Locked",
};

const moduleStatusVariant: Record<string, "secondary" | "outline"> = {
  completed: "secondary",
  "in-progress": "outline",
  locked: "outline",
};

export default function StudentCoursesPage() {
  return (
    <DashboardShell
      role="student"
      roleLabel="Student"
      userName="Yusuf Khan"
      title="My Courses"
      description="Continue your learning journey, one lesson at a time."
    >
      <div className="flex flex-col gap-8">

        {/* Explore more courses */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl text-primary">Explore More Courses</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/courses">
                View Catalog <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exploreCourses.map((course) => (
              <Card key={course.name} className="flex flex-col border-border/80">
                <CardHeader>
                  <span className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <course.icon className="size-5" />
                  </span>
                  <CardTitle className="text-base">{course.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {course.levels.map((level) => (
                      <Badge key={level} variant="outline" className="rounded-full">
                        {level}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/courses">Enroll Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enrolled courses */}
        <div className="flex flex-col gap-5">
          {enrolledCourses.map((course) => (
            <Card key={course.name} className="border-border/80">
              <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <course.icon className="size-6" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <Badge variant="outline" className="rounded-full">
                        {course.level}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <User className="size-3.5" /> {course.teacher}
                    </CardDescription>
                  </div>
                </div>
                <Button className="w-full sm:w-auto">
                  Continue Learning <ArrowRight className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Next up: <span className="font-medium text-foreground">{course.nextLesson}</span>
                    </span>
                    <span className="font-medium text-primary">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>

                <Accordion type="single" collapsible className="rounded-lg border border-border px-4">
                  {course.modules.map((module) => (
                    <AccordionItem key={module.title} value={module.title}>
                      <AccordionTrigger>
                        <div className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-2">
                          <span>{module.title}</span>
                          <Badge variant={moduleStatusVariant[module.status]} className="rounded-full">
                            {moduleStatusLabel[module.status]}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="flex flex-col gap-2">
                          {module.lessons.map((lesson) => (
                            <li
                              key={lesson.title}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              {lessonIcon(lesson.status)}
                              <span className={lesson.status === "completed" ? "text-foreground" : ""}>
                                {lesson.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>


      </div>
    </DashboardShell>
  );
}
