import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendDailyProgressReportEmail, type DailyReportData } from "@/lib/mailer";

// Called daily via Hostinger hPanel cron: GET /api/cron/progress-report
// Secured with a shared secret set in CRON_SECRET env var.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Fetch all data in parallel
  const [progressEntries, attendances, gradedSubmissions, upcomingAssignments] = await Promise.all([
    prisma.progressEntry.findMany({
      where: { recordedAt: { gte: since } },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { name: true } },
      },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.attendance.findMany({
      where: { recordedAt: { gte: since } },
      include: {
        student: { select: { id: true, name: true, email: true } },
        classSession: {
          select: { scheduledStart: true, course: { select: { name: true } } },
        },
      },
    }),
    prisma.submission.findMany({
      where: {
        reviewedAt: { gte: since },
        status: "REVIEWED",
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        assignment: { select: { title: true, course: { select: { name: true } } } },
      },
    }),
    prisma.assignment.findMany({
      where: { dueDate: { gte: new Date(), lte: in48h } },
      include: {
        course: { select: { name: true } },
        submissions: { select: { studentUserId: true } },
        // enrollments via course to find which students have this
      },
    }),
  ]);

  // Collect all unique student IDs with activity today
  const studentIds = new Set<string>([
    ...progressEntries.map((e) => e.student.id),
    ...attendances.map((a) => a.student.id),
    ...gradedSubmissions.map((s) => s.student.id),
  ]);

  // Also include students with upcoming assignments (need enrolled students)
  const enrolledStudentIds = upcomingAssignments.length > 0
    ? await prisma.enrollment.findMany({
        where: {
          courseId: { in: upcomingAssignments.map((a) => a.courseId) },
          status: "ACTIVE",
        },
        select: { studentUserId: true },
      })
    : [];

  for (const { studentUserId } of enrolledStudentIds) {
    studentIds.add(studentUserId);
  }

  if (studentIds.size === 0) {
    return NextResponse.json({ ok: true, emailsSent: 0 });
  }

  // Fetch student records + parent links for all relevant students
  const students = await prisma.user.findMany({
    where: { id: { in: Array.from(studentIds) } },
    select: {
      id: true,
      name: true,
      email: true,
      parentLinks: {
        select: {
          parent: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  // Build per-student report data
  const assignmentsByEnrolledStudent = new Map<string, typeof upcomingAssignments>();
  for (const assignment of upcomingAssignments) {
    const submittedStudentIds = new Set(assignment.submissions.map((s) => s.studentUserId));
    for (const { studentUserId } of enrolledStudentIds) {
      if (!submittedStudentIds.has(studentUserId)) {
        const list = assignmentsByEnrolledStudent.get(studentUserId) ?? [];
        list.push(assignment);
        assignmentsByEnrolledStudent.set(studentUserId, list);
      }
    }
  }

  let sent = 0;

  await Promise.allSettled(
    students.map(async (student) => {
      const report: DailyReportData = {
        progressEntries: progressEntries
          .filter((e) => e.student.id === student.id)
          .map((e) => ({
            courseName: e.course.name,
            subjectArea: e.subjectArea,
            description: e.description,
            percentComplete: e.percentComplete,
          })),
        attendances: attendances
          .filter((a) => a.student.id === student.id)
          .map((a) => ({
            courseName: a.classSession.course.name,
            status: a.status,
            sessionStart: a.classSession.scheduledStart,
          })),
        gradedSubmissions: gradedSubmissions
          .filter((s) => s.student.id === student.id)
          .map((s) => ({
            assignmentTitle: s.assignment.title,
            grade: s.grade,
            feedback: s.feedback,
          })),
        upcomingAssignments: (assignmentsByEnrolledStudent.get(student.id) ?? []).map((a) => ({
          title: a.title,
          courseName: a.course.name,
          dueDate: a.dueDate,
        })),
      };

      const hasContent =
        report.progressEntries.length > 0 ||
        report.attendances.length > 0 ||
        report.gradedSubmissions.length > 0 ||
        report.upcomingAssignments.length > 0;
      if (!hasContent) return;

      // Send to student
      await sendDailyProgressReportEmail(student.email, student.name, student.name, report);
      sent++;

      // Send to each linked parent
      for (const { parent } of student.parentLinks) {
        await sendDailyProgressReportEmail(parent.email, parent.name, student.name, report);
        sent++;
      }
    })
  );

  return NextResponse.json({ ok: true, emailsSent: sent });
}
