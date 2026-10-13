import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  Brain,
  GraduationCap,
  Landmark,
  Languages,
  Mic,
  ScrollText,
} from "lucide-react";
import { CURRICULUM, TRACK_COURSES, type TrackCourse } from "./data";

/**
 * Presentation metadata for the seven curriculum tracks. User-facing copy
 * (description / audience) lives in messages under `marketing.tracks.<messageKey>`.
 */
export type TrackInfo = {
  name: TrackCourse;
  slug: string;
  icon: LucideIcon;
  messageKey: string;
};

const META: Record<TrackCourse, Omit<TrackInfo, "name">> = {
  "Quran Reading": { slug: "quran-reading", icon: BookOpenText, messageKey: "quranReading" },
  Tajweed: { slug: "tajweed", icon: Mic, messageKey: "tajweed" },
  "Hifz-ul-Quran": { slug: "hifz", icon: Brain, messageKey: "hifz" },
  "Quran Understanding": { slug: "understanding", icon: Languages, messageKey: "understanding" },
  "Islamic Studies": { slug: "islamic-studies", icon: Landmark, messageKey: "islamicStudies" },
  "Advanced Quranic Studies": { slug: "advanced", icon: ScrollText, messageKey: "advanced" },
  "Quran Teacher Preparation": {
    slug: "teacher-preparation",
    icon: GraduationCap,
    messageKey: "teacherPreparation",
  },
};

export const TRACKS: TrackInfo[] = TRACK_COURSES.map((name) => ({ name, ...META[name] }));

export function trackFor(courseName: string): TrackInfo | undefined {
  return TRACKS.find((t) => t.name === courseName);
}

export function levelRange(track: TrackCourse): {
  first: number;
  last: number;
  levels: number;
  modules: number;
} {
  const levels = CURRICULUM.filter((l) => l.courseName === track);
  return {
    first: Math.min(...levels.map((l) => l.number)),
    last: Math.max(...levels.map((l) => l.number)),
    levels: levels.length,
    modules: levels.reduce((n, l) => n + l.modules.length, 0),
  };
}

export const CURRICULUM_TOTALS = {
  tracks: TRACK_COURSES.length,
  levels: CURRICULUM.length,
  modules: CURRICULUM.reduce((n, l) => n + l.modules.length, 0),
};

/**
 * Splits courses into curriculum tracks (in learning order, with their track
 * metadata) and everything else. Every non-track course lands in `others`,
 * including renamed or admin-created courses that have levels, so no active
 * course ever disappears from the catalogue.
 */
export function partitionCourses<C extends { name: string }>(
  courses: C[]
): { tracks: { course: C; track: TrackInfo }[]; others: C[] } {
  const order = new Map(TRACKS.map((t, i) => [t.name as string, i]));
  const tracks: { course: C; track: TrackInfo }[] = [];
  const others: C[] = [];
  for (const course of courses) {
    const track = trackFor(course.name);
    if (track) tracks.push({ course, track });
    else others.push(course);
  }
  tracks.sort((a, b) => order.get(a.course.name)! - order.get(b.course.name)!);
  return { tracks, others };
}
