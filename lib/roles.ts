import type { Role } from "@/lib/generated/prisma/client";
import type { DashboardRole } from "@/components/dashboard/nav-config";

export const roleToDashboard: Record<Role, DashboardRole> = {
  SUPER_ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
};

export const roleToBasePath: Record<Role, string> = {
  SUPER_ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
};

export const pathPrefixToRole: Record<string, Role> = {
  "/admin": "SUPER_ADMIN",
  "/teacher": "TEACHER",
  "/student": "STUDENT",
  "/parent": "PARENT",
};

export const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
};
