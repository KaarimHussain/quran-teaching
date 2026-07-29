"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { sendParticipantAddedEmail } from "@/lib/mailer";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export type CreateSessionState = { error?: string } | undefined;

export async function createClassSession(
  _prevState: CreateSessionState,
  formData: FormData
): Promise<CreateSessionState> {
  await requireAdmin();

  const courseId = formData.get("courseId");
  const teacherUserId = formData.get("teacherUserId");
  const type = formData.get("type");
  const scheduledStart = formData.get("scheduledStart");
  const scheduledEnd = formData.get("scheduledEnd");

  const genderRestriction = formData.get("genderRestriction");
  const maxParticipantsRaw = formData.get("maxParticipants");

  if (
    typeof courseId !== "string" ||
    typeof teacherUserId !== "string" ||
    typeof scheduledStart !== "string" ||
    typeof scheduledEnd !== "string" ||
    (type !== "ONE_TO_ONE" && type !== "GROUP" && type !== "SEMI_PRIVATE")
  ) {
    return { error: "Please fill in all fields." };
  }

  const validGender = ["MIXED", "SISTERS_ONLY", "BROTHERS_ONLY"];
  const resolvedGender =
    typeof genderRestriction === "string" && validGender.includes(genderRestriction)
      ? (genderRestriction as "MIXED" | "SISTERS_ONLY" | "BROTHERS_ONLY")
      : "MIXED";

  const maxParticipants =
    typeof maxParticipantsRaw === "string" && maxParticipantsRaw.trim()
      ? parseInt(maxParticipantsRaw, 10)
      : null;

  const start = new Date(scheduledStart);
  const end = new Date(scheduledEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Please provide valid start and end times." };
  }

  if (end <= start) {
    return { error: "End time must be after the start time." };
  }

  const [course, teacher] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }),
    prisma.user.findUnique({
      where: { id: teacherUserId },
      select: { id: true, role: true, verificationStatus: true },
    }),
  ]);

  if (!course) {
    return { error: "Selected course no longer exists." };
  }

  if (!teacher || teacher.role !== "TEACHER" || teacher.verificationStatus !== "VERIFIED") {
    return { error: "Selected teacher is not a verified teacher." };
  }

  await prisma.classSession.create({
    data: {
      courseId,
      teacherUserId,
      type,
      genderRestriction: resolvedGender,
      maxParticipants,
      scheduledStart: start,
      scheduledEnd: end,
      status: "SCHEDULED",
    },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/admin");
}

export async function cancelClassSession(formData: FormData) {
  await requireAdmin();

  const sessionId = formData.get("sessionId");
  if (typeof sessionId !== "string") return;

  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { status: true },
  });

  if (!session || (session.status !== "SCHEDULED" && session.status !== "LIVE")) {
    return;
  }

  await prisma.classSession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/admin");
}

export async function addClassParticipant(formData: FormData) {
  await requireAdmin();

  const classSessionId = formData.get("classSessionId");
  const studentUserId = formData.get("studentUserId");

  if (typeof classSessionId !== "string" || typeof studentUserId !== "string") return;

  const [, student, session] = await Promise.all([
    prisma.classParticipant.upsert({
      where: { classSessionId_studentUserId: { classSessionId, studentUserId } },
      update: {},
      create: { classSessionId, studentUserId },
    }),
    prisma.user.findUnique({ where: { id: studentUserId }, select: { email: true, name: true } }),
    prisma.classSession.findUnique({
      where: { id: classSessionId },
      include: { course: { select: { name: true } } },
    }),
  ]);

  if (student && session) {
    void sendParticipantAddedEmail(
      student.email,
      student.name,
      session.course.name,
      session.scheduledStart,
      session.joinUrl
    );
  }

  revalidatePath("/admin/schedule");
}

export async function removeClassParticipant(formData: FormData) {
  await requireAdmin();

  const classSessionId = formData.get("classSessionId");
  const studentUserId = formData.get("studentUserId");

  if (typeof classSessionId !== "string" || typeof studentUserId !== "string") return;

  await prisma.classParticipant.deleteMany({
    where: { classSessionId, studentUserId },
  });

  revalidatePath("/admin/schedule");
}

export type MakeupSessionState = { error?: string } | undefined;

export async function scheduleMakeupSession(
  _prevState: MakeupSessionState,
  formData: FormData
): Promise<MakeupSessionState> {
  await requireAdmin();

  const makeupForSessionId = formData.get("makeupForSessionId");
  const scheduledStart = formData.get("scheduledStart");
  const scheduledEnd = formData.get("scheduledEnd");

  if (
    typeof makeupForSessionId !== "string" ||
    typeof scheduledStart !== "string" ||
    typeof scheduledEnd !== "string"
  ) {
    return { error: "Please fill in all fields." };
  }

  const original = await prisma.classSession.findUnique({
    where: { id: makeupForSessionId },
    select: {
      courseId: true,
      teacherUserId: true,
      type: true,
      genderRestriction: true,
      maxParticipants: true,
    },
  });

  if (!original) return { error: "Original session not found." };

  const start = new Date(scheduledStart);
  const end = new Date(scheduledEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Invalid date/time." };
  }

  if (end <= start) return { error: "End time must be after start time." };

  await prisma.classSession.create({
    data: {
      courseId: original.courseId,
      teacherUserId: original.teacherUserId,
      type: original.type,
      genderRestriction: original.genderRestriction,
      maxParticipants: original.maxParticipants,
      scheduledStart: start,
      scheduledEnd: end,
      status: "SCHEDULED",
      makeupForSessionId,
    },
  });

  revalidatePath("/admin/schedule");
}

export async function setParentJoinUrl(formData: FormData) {
  await requireAdmin();

  const sessionId = formData.get("sessionId");
  const parentJoinUrl = formData.get("parentJoinUrl");

  if (typeof sessionId !== "string") return;

  await prisma.classSession.update({
    where: { id: sessionId },
    data: {
      parentJoinUrl:
        typeof parentJoinUrl === "string" && parentJoinUrl.trim()
          ? parentJoinUrl.trim()
          : null,
    },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/parent/sessions");
}

export async function addParentObserver(formData: FormData) {
  await requireAdmin();

  const classSessionId = formData.get("classSessionId");
  const parentUserId = formData.get("parentUserId");

  if (typeof classSessionId !== "string" || typeof parentUserId !== "string") return;

  await prisma.parentSessionObserver.upsert({
    where: { classSessionId_parentUserId: { classSessionId, parentUserId } },
    update: {},
    create: { classSessionId, parentUserId },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/parent/sessions");
}

export async function removeParentObserver(formData: FormData) {
  await requireAdmin();

  const classSessionId = formData.get("classSessionId");
  const parentUserId = formData.get("parentUserId");

  if (typeof classSessionId !== "string" || typeof parentUserId !== "string") return;

  await prisma.parentSessionObserver.deleteMany({
    where: { classSessionId, parentUserId },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/parent/sessions");
}

export async function upsertAttendance(formData: FormData) {
  const admin = await requireAdmin();

  const classSessionId = formData.get("classSessionId");
  const studentUserId = formData.get("studentUserId");
  const status = formData.get("status");

  if (
    typeof classSessionId !== "string" ||
    typeof studentUserId !== "string" ||
    (status !== "PRESENT" && status !== "ABSENT" && status !== "LATE")
  ) {
    return;
  }

  await prisma.attendance.upsert({
    where: { classSessionId_studentUserId: { classSessionId, studentUserId } },
    update: { status, markedByUserId: admin.id, recordedAt: new Date() },
    create: { classSessionId, studentUserId, status, markedByUserId: admin.id },
  });

  revalidatePath("/admin/schedule");
}
