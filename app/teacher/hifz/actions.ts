"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { getTeacherCourseIds } from "@/lib/teacher";
import {
  addDays,
  nextIntervalDays,
  INITIAL_INTERVAL_DAYS,
  DEFAULT_EASE_FACTOR,
} from "@/lib/hifz-scheduler";

async function requireTeacher() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") throw new Error("Forbidden");
  return user;
}

export type HifzScheduleState = { error?: string } | undefined;

export async function createHifzSchedule(
  _prev: HifzScheduleState,
  formData: FormData
): Promise<HifzScheduleState> {
  const user = await requireTeacher();

  const courseId = formData.get("courseId");
  const studentUserId = formData.get("studentUserId");
  const surah = formData.get("surah");
  const ayahFrom = formData.get("ayahFrom");
  const ayahTo = formData.get("ayahTo");

  if (
    typeof courseId !== "string" ||
    typeof studentUserId !== "string" ||
    typeof surah !== "string" ||
    !surah.trim()
  ) {
    return { error: "Please fill in all required fields." };
  }

  const from = parseInt(typeof ayahFrom === "string" ? ayahFrom : "1", 10);
  const to = parseInt(typeof ayahTo === "string" ? ayahTo : "1", 10);

  if (Number.isNaN(from) || Number.isNaN(to) || from > to) {
    return { error: "Ayah range is invalid." };
  }

  const courseIds = await getTeacherCourseIds(user.id);
  if (!courseIds.includes(courseId)) return { error: "You don't teach this course." };

  const schedule = await prisma.hifzReviewSchedule.create({
    data: {
      studentUserId,
      courseId,
      surah: surah.trim(),
      ayahFrom: from,
      ayahTo: to,
      createdByUserId: user.id,
    },
  });

  // Seed the first review session due tomorrow
  await prisma.hifzReviewSession.create({
    data: {
      scheduleId: schedule.id,
      dueDate: addDays(new Date(), INITIAL_INTERVAL_DAYS),
      status: "SCHEDULED",
    },
  });

  revalidatePath("/teacher/hifz");
  revalidatePath("/student/hifz");
}

export type MarkReviewState = { error?: string } | undefined;

export async function markHifzReview(
  _prev: MarkReviewState,
  formData: FormData
): Promise<MarkReviewState> {
  const user = await requireTeacher();

  const sessionId = formData.get("sessionId");
  const qualityRaw = formData.get("quality");
  const notes = formData.get("notes");

  if (typeof sessionId !== "string") return { error: "Invalid session." };

  const quality = parseInt(typeof qualityRaw === "string" ? qualityRaw : "3", 10);
  if (Number.isNaN(quality) || quality < 0 || quality > 5) {
    return { error: "Quality must be 0–5." };
  }

  const session = await prisma.hifzReviewSession.findUnique({
    where: { id: sessionId },
    include: {
      schedule: {
        include: { createdBy: { select: { id: true } } },
      },
    },
  });

  if (!session) return { error: "Review session not found." };
  if (session.schedule.createdBy.id !== user.id) return { error: "Unauthorized." };
  if (session.status !== "SCHEDULED") return { error: "Session already completed." };

  // Compute previous interval
  const allSessions = await prisma.hifzReviewSession.findMany({
    where: { scheduleId: session.scheduleId, status: "COMPLETED" },
    orderBy: { reviewedAt: "desc" },
    take: 1,
  });

  const prevInterval =
    allSessions.length > 0
      ? Math.round(
          (session.dueDate.getTime() - allSessions[0].dueDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : INITIAL_INTERVAL_DAYS;

  const { intervalDays } = nextIntervalDays(quality, prevInterval, DEFAULT_EASE_FACTOR);

  await prisma.$transaction([
    prisma.hifzReviewSession.update({
      where: { id: sessionId },
      data: {
        status: quality < 3 ? "MISSED" : "COMPLETED",
        quality,
        notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
        reviewedAt: new Date(),
      },
    }),
    prisma.hifzReviewSession.create({
      data: {
        scheduleId: session.scheduleId,
        dueDate: addDays(new Date(), intervalDays),
        status: "SCHEDULED",
      },
    }),
  ]);

  revalidatePath("/teacher/hifz");
  revalidatePath("/student/hifz");
}
