"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const Schema = z
  .object({
    token: z.string().min(1, "Reset token is missing."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetState =
  | { success: true }
  | { error?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

export async function resetPassword(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const result = Schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const { token, password } = result.data;

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.usedAt !== null || record.expiresAt < new Date()) {
    return {
      error:
        "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.email },
      data: { passwordHash: hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
