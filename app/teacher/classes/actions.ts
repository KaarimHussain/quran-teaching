"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

async function requireTeacher() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function markAttendance(formData: FormData) {
  const user = await requireTeacher();

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

  const session = await prisma.classSession.findUnique({
    where: { id: classSessionId },
    select: { teacherUserId: true },
  });
  if (!session || session.teacherUserId !== user.id) return;

  await prisma.attendance.upsert({
    where: { classSessionId_studentUserId: { classSessionId, studentUserId } },
    update: { status, markedByUserId: user.id },
    create: { classSessionId, studentUserId, status, markedByUserId: user.id },
  });

  revalidatePath("/teacher/classes");
}

export async function goLive(formData: FormData) {
  const user = await requireTeacher();
  const sessionId = formData.get("sessionId");
  if (typeof sessionId !== "string") return;

  const session = await prisma.classSession.findFirst({
    where: { id: sessionId, teacherUserId: user.id, status: "SCHEDULED" },
  });
  if (!session) return;

  const joinUrl = `https://meet.jit.si/quranlearning-${sessionId}`;
  await prisma.classSession.update({
    where: { id: sessionId },
    data: { status: "LIVE", joinUrl },
  });

  revalidatePath("/teacher/classes");
  revalidatePath("/student/schedule");
}

export async function endSession(formData: FormData) {
  const user = await requireTeacher();
  const sessionId = formData.get("sessionId");
  if (typeof sessionId !== "string") return;

  await prisma.classSession.updateMany({
    where: { id: sessionId, teacherUserId: user.id, status: "LIVE" },
    data: { status: "COMPLETED", joinUrl: null },
  });

  revalidatePath("/teacher/classes");
  revalidatePath("/student/schedule");
}
