"use server";

import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mailer";

const Schema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
});

export type ForgotState =
  | { success: true; devLink?: string }
  | { error?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

export async function requestPasswordReset(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const result = Schema.safeParse({ email: formData.get("email") });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const { email } = result.data;

  // Look up user — but don't reveal whether the email exists to the caller
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.isActive) {
    // Delete any stale (expired but unused) tokens for this address
    await prisma.passwordResetToken.deleteMany({
      where: { email, usedAt: null, expiresAt: { lt: new Date() } },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    const resetUrl = `${base}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetUrl);
    console.log(`[Password Reset] Link for ${email}: ${resetUrl}`);

    // Expose the link in non-production so the team can test without email
    const devLink = process.env.NODE_ENV !== "production" ? resetUrl : undefined;
    return { success: true, devLink };
  }

  // Always return success — prevents email enumeration
  return { success: true };
}
