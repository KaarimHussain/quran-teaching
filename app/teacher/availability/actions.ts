"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export type AddAvailabilityState = { error?: string } | undefined;

async function requireTeacher() {
  const user = await requireCurrentUser();
  if (user.role !== "TEACHER") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function addAvailability(
  _prevState: AddAvailabilityState,
  formData: FormData
): Promise<AddAvailabilityState> {
  const user = await requireTeacher();

  const dayOfWeek = formData.get("dayOfWeek");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");

  if (typeof dayOfWeek !== "string" || typeof startTime !== "string" || typeof endTime !== "string") {
    return { error: "All fields are required." };
  }

  const day = Number(dayOfWeek);
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    return { error: "Invalid day of week." };
  }

  if (!startTime || !endTime || startTime >= endTime) {
    return { error: "End time must be after start time." };
  }

  const existing = await prisma.teacherAvailability.findMany({
    where: { teacherUserId: user.id, dayOfWeek: day },
  });

  const overlaps = existing.some((slot) => startTime < slot.endTime && endTime > slot.startTime);
  if (overlaps) {
    return { error: "This overlaps with an existing availability window on that day." };
  }

  await prisma.teacherAvailability.create({
    data: {
      teacherUserId: user.id,
      dayOfWeek: day,
      startTime,
      endTime,
      isRecurring: true,
    },
  });

  revalidatePath("/teacher/availability");
  revalidatePath("/teacher");
}

export async function removeAvailability(formData: FormData) {
  const user = await requireTeacher();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.teacherAvailability.deleteMany({
    where: { id, teacherUserId: user.id },
  });

  revalidatePath("/teacher/availability");
  revalidatePath("/teacher");
}
