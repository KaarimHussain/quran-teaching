"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { getTeacherCourseIds } from "@/lib/teacher";
import { sendHomeworkAssignedEmail, sendHomeworkGradedEmail } from "@/lib/mailer";

export type CreateAssignmentState = { error?: string } | undefined;

async function requireTeacher() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function createAssignment(
  _prevState: CreateAssignmentState,
  formData: FormData
): Promise<CreateAssignmentState> {
  const user = await requireTeacher();

  const courseId = formData.get("courseId");
  const title = formData.get("title");
  const description = formData.get("description");
  const dueDate = formData.get("dueDate");
  const isWorksheetRaw = formData.get("isWorksheet");
  const targetStudentUserId = formData.get("targetStudentUserId");

  if (typeof courseId !== "string" || typeof title !== "string" || title.trim().length < 3) {
    return { error: "Title must be at least 3 characters." };
  }

  if (typeof dueDate !== "string" || !dueDate) {
    return { error: "Please choose a due date." };
  }

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) {
    return { error: "Invalid due date." };
  }

  const isWorksheet = isWorksheetRaw === "true";

  const resolvedTargetStudentId =
    isWorksheet && typeof targetStudentUserId === "string" && targetStudentUserId.trim()
      ? targetStudentUserId.trim()
      : null;

  if (isWorksheet && !resolvedTargetStudentId) {
    return { error: "Please select a target student for this worksheet." };
  }

  const teacherCourseIds = await getTeacherCourseIds(user.id);
  if (!teacherCourseIds.includes(courseId)) {
    return { error: "You don't teach this course." };
  }

  const [assignment, course, enrollments] = await Promise.all([
    prisma.assignment.create({
      data: {
        courseId,
        teacherUserId: user.id,
        title: title.trim(),
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        dueDate: due,
        isWorksheet,
        targetStudentUserId: resolvedTargetStudentId,
      },
    }),
    prisma.course.findUnique({ where: { id: courseId }, select: { name: true } }),
    prisma.enrollment.findMany({
      where: { courseId, status: "ACTIVE" },
      include: { student: { select: { id: true, email: true, name: true } } },
    }),
  ]);

  if (course) {
    const recipients = resolvedTargetStudentId
      ? enrollments.filter((e) => e.student.id === resolvedTargetStudentId)
      : enrollments;

    void Promise.allSettled(
      recipients.map((e) =>
        sendHomeworkAssignedEmail(e.student.email, e.student.name, assignment.title, course.name, due)
      )
    );
  }

  revalidatePath("/teacher/assignments");
  revalidatePath("/teacher");
}

export type GradeState = { error?: string } | undefined;

export async function gradeSubmission(
  _prevState: GradeState,
  formData: FormData
): Promise<GradeState> {
  const user = await requireTeacher();

  const submissionId = formData.get("submissionId");
  const grade = formData.get("grade");
  const feedback = formData.get("feedback");

  if (typeof submissionId !== "string") {
    return { error: "Invalid submission." };
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: { select: { teacherUserId: true, title: true } },
      student: { select: { email: true, name: true } },
    },
  });
  if (!submission || submission.assignment.teacherUserId !== user.id) {
    return { error: "Submission not found or unauthorized." };
  }

  const finalGrade = typeof grade === "string" && grade.trim() ? grade.trim() : null;
  const finalFeedback = typeof feedback === "string" && feedback.trim() ? feedback.trim() : null;

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "REVIEWED",
      grade: finalGrade,
      feedback: finalFeedback,
      reviewedAt: new Date(),
    },
  });

  void sendHomeworkGradedEmail(
    submission.student.email,
    submission.student.name,
    submission.assignment.title,
    finalGrade,
    finalFeedback
  );

  revalidatePath("/teacher/assignments");
  revalidatePath("/teacher");
}
