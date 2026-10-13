import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Courses are linked to teachers only through ClassSession/Assignment rows
 * (Course has no direct teacherUserId), so a teacher's course list is the
 * distinct union of courses they've taught a class in or set an assignment for.
 */
export async function getTeacherCourseIds(teacherUserId: string): Promise<string[]> {
  const [sessions, assignments] = await Promise.all([
    prisma.classSession.findMany({
      where: { teacherUserId },
      distinct: ["courseId"],
      select: { courseId: true },
    }),
    prisma.assignment.findMany({
      where: { teacherUserId },
      distinct: ["courseId"],
      select: { courseId: true },
    }),
  ]);

  return Array.from(new Set([...sessions.map((s) => s.courseId), ...assignments.map((a) => a.courseId)]));
}

/**
 * Same set of courses as getTeacherCourseIds, expressed as a relation filter so
 * it can be inlined into a query instead of costing a separate round-trip first.
 */
export function teacherCoursesWhere(teacherUserId: string): Prisma.CourseWhereInput {
  return {
    OR: [
      { classSessions: { some: { teacherUserId } } },
      { assignments: { some: { teacherUserId } } },
    ],
  };
}
