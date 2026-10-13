import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Curriculum modules are visible only to students enrolled in their track
 * course — a teacher can only sign off enrolled students, so showing them to
 * everyone would leave unenrolled students stuck at the first module.
 */
export const CURRICULUM_MODULE_DEFAULTS = { isFree: false, isGated: true } as const;

/**
 * The modules a student can see: free modules plus modules of courses they are
 * actively enrolled in. Used by both /student/learn and the completion action
 * so the page and the server-side lock check gate over the same set.
 */
export function studentVisibleModulesWhere(
  studentUserId: string,
  courseId?: string
): Prisma.CourseModuleWhereInput {
  return {
    ...(courseId ? { courseId } : {}),
    OR: [
      { isFree: true },
      { course: { enrollments: { some: { studentUserId, status: "ACTIVE" } } } },
    ],
  };
}
