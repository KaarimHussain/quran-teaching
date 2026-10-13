/**
 * A teacher may sign off a module only for a course they teach and in which the
 * student holds an active enrollment.
 */
export function canSignOff(args: {
  teacherCourseIds: string[];
  studentCourseIds: string[];
  moduleCourseId: string;
}): boolean {
  return (
    args.teacherCourseIds.includes(args.moduleCourseId) &&
    args.studentCourseIds.includes(args.moduleCourseId)
  );
}
