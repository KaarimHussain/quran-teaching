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
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const studentNav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/student/progress", label: "Progress", icon: LineChart },
  { href: "/student/resources", label: "Resources", icon: Library },
  { href: "/student/certificates", label: "Certificates", icon: Award },
  { href: "/student/forum", label: "Forum", icon: MessagesSquare },
];

export const teacherNav: NavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/availability", label: "Availability", icon: CalendarDays },
  { href: "/teacher/classes", label: "Classes", icon: BookOpen },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/teacher/resources", label: "Resources", icon: Library },
  { href: "/teacher/forum", label: "Forum", icon: MessagesSquare },
];

export const parentNav: NavItem[] = [
  { href: "/parent", label: "Dashboard", icon: LayoutDashboard },
  { href: "/parent/children", label: "My Children", icon: Heart },
  { href: "/parent/attendance", label: "Attendance", icon: CalendarDays },
  { href: "/parent/progress", label: "Progress", icon: LineChart },
  { href: "/parent/homework", label: "Homework", icon: ClipboardList },
  { href: "/parent/messages", label: "Messages", icon: MessagesSquare },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/admin/verifications", label: "Teacher Verification", icon: UserCheck },
  { href: "/admin/forum", label: "Forum Moderation", icon: Megaphone },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export type DashboardRole = "student" | "teacher" | "parent" | "admin";

export const navByRole: Record<DashboardRole, NavItem[]> = {
  student: studentNav,
  teacher: teacherNav,
  parent: parentNav,
  admin: adminNav,
};
