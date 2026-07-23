"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import { roleToBasePath } from "@/lib/roles";
import { LoginFormSchema, RegisterFormSchema } from "@/lib/definitions";
import { sendWelcomeEmail } from "@/lib/mailer";

async function setLocaleCookie(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export type AuthFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const result = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id, user.role);
  await setLocaleCookie(user.preferredLanguage ?? "EN");
  redirect(roleToBasePath[user.role]);
}

export async function register(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const result = RegisterFormSchema.safeParse({
    role: formData.get("role"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    language: formData.get("language"),
    terms: formData.get("terms"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const { role, name, email, password, language } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: ["An account with this email already exists."] } };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      preferredLanguage: language,
      ...(role === "TEACHER" ? { isVolunteer: true, verificationStatus: "PENDING" } : {}),
    },
  });

  await sendWelcomeEmail(user.email, user.name, user.role);
  await createSession(user.id, user.role);
  await setLocaleCookie(language ?? "EN");
  redirect(roleToBasePath[user.role]);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
