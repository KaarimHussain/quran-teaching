import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, COOKIE_NAME, type SessionPayload } from "@/lib/session";
import { prisma } from "@/lib/db";
import { roleToBasePath } from "@/lib/roles";

export const getOptionalSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(COOKIE_NAME)?.value);
});

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getOptionalSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getOptionalSession();
  if (!session?.userId) return null;

  return prisma.user.findUnique({ where: { id: session.userId } });
});

export const requireCurrentUser = cache(async () => {
  const session = await verifySession();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });

  if (!user || !user.isActive) {
    redirect("/login");
  }

  return user;
});

export function dashboardPathForRole(role: SessionPayload["role"]) {
  return roleToBasePath[role];
}
