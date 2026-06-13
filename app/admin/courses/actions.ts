"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";

export type CreateCourseState = { error?: string } | undefined;

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function toggleCourseActive(formData: FormData) {
  await requireAdmin();

  const courseId = formData.get("courseId");
  if (typeof courseId !== "string") return;

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { isActive: true } });
  if (!course) return;

  await prisma.course.update({
    where: { id: courseId },
    data: { isActive: !course.isActive },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
}

export async function createCourse(
  _prevState: CreateCourseState,
  formData: FormData
): Promise<CreateCourseState> {
  await requireAdmin();

  const name = formData.get("name");
  const description = formData.get("description");

  if (typeof name !== "string" || name.trim().length < 2) {
    return { error: "Course name must be at least 2 characters." };
  }

  try {
    await prisma.course.create({
      data: {
        name: name.trim(),
        description: typeof description === "string" && description.trim() ? description.trim() : null,
      },
    });
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return { error: "A course with this name already exists." };
    }
    throw err;
  }

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
}
