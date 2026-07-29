import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ClipboardList,
  LineChart,
  Library,
  Award,
  MessagesSquare,
  Users,
  UserCheck,
  Megaphone,
  Heart,
  BarChart3,
  Bell,
  FolderOpen,
  CalendarX2,
  BookMarked,
} from "lucide-react";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

export const studentNav: NavItem[] = [
  { href: "/student", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/student/courses", labelKey: "courses", icon: BookOpen },
  { href: "/student/schedule", labelKey: "schedule", icon: CalendarDays },
  { href: "/student/assignments", labelKey: "assignments", icon: ClipboardList },
  { href: "/student/progress", labelKey: "progress", icon: LineChart },
  { href: "/student/resources", labelKey: "resources", icon: Library },
  { href: "/student/certificates", labelKey: "certificates", icon: Award },
  { href: "/student/forum", labelKey: "forum", icon: MessagesSquare },
  { href: "/student/makeup", labelKey: "makeup", icon: CalendarX2 },
  { href: "/quran", labelKey: "quran", icon: BookMarked },
];

export const teacherNav: NavItem[] = [
  { href: "/teacher", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/teacher/availability", labelKey: "availability", icon: CalendarDays },
  { href: "/teacher/classes", labelKey: "classes", icon: BookOpen },
  { href: "/teacher/students", labelKey: "students", icon: Users },
  { href: "/teacher/assignments", labelKey: "assignments", icon: ClipboardList },
  { href: "/teacher/resources", labelKey: "resources", icon: Library },
  { href: "/teacher/forum", labelKey: "forum", icon: MessagesSquare },
];

export const parentNav: NavItem[] = [
  { href: "/parent", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/parent/children", labelKey: "children", icon: Heart },
  { href: "/parent/attendance", labelKey: "attendance", icon: CalendarDays },
  { href: "/parent/progress", labelKey: "progress", icon: LineChart },
  { href: "/parent/homework", labelKey: "homework", icon: ClipboardList },
  { href: "/parent/messages", labelKey: "messages", icon: MessagesSquare },
];

export const adminNav: NavItem[] = [
  { href: "/admin", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/users", labelKey: "users", icon: Users },
  { href: "/admin/courses", labelKey: "courses", icon: BookOpen },
  { href: "/admin/schedule", labelKey: "schedule", icon: CalendarDays },
  { href: "/admin/verifications", labelKey: "verifications", icon: UserCheck },
  { href: "/admin/certificates", labelKey: "certificates", icon: Award },
  { href: "/admin/resources", labelKey: "resources", icon: FolderOpen },
  { href: "/admin/announcements", labelKey: "announcements", icon: Bell },
  { href: "/admin/forum", labelKey: "forum", icon: Megaphone },
  { href: "/admin/makeup", labelKey: "makeup", icon: CalendarX2 },
  { href: "/admin/reports", labelKey: "reports", icon: BarChart3 },
];

export type DashboardRole = "student" | "teacher" | "parent" | "admin";

export const navByRole: Record<DashboardRole, NavItem[]> = {
  student: studentNav,
  teacher: teacherNav,
  parent: parentNav,
  admin: adminNav,
};
