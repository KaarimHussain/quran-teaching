import Link from "next/link";
import { BookOpenText, Bell, LogOut, Menu } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardNav } from "./dashboard-nav";
import type { DashboardRole } from "./nav-config";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

type Language = "EN" | "UR" | "AR";

type DashboardShellProps = {
  role: DashboardRole;
  roleLabel: string;
  userName: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SidebarContent({
  role,
  userName,
  roleLabel,
  t,
  initials,
}: {
  role: DashboardRole;
  userName: string;
  roleLabel: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  initials: string;
}) {
  return (
    <>
      {/* Branded header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
        <Link
          href="/"
          className="relative flex h-16 items-center gap-2.5 px-5"
          aria-label="Go to home page"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <BookOpenText className="size-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-lg leading-tight text-primary">{t("appName")}</span>
        </Link>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-3">
        <DashboardNav role={role} />
      </div>

      <Separator />

      {/* User footer */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{userName}</span>
          <Badge variant="secondary" className="mt-0.5 w-fit rounded-full text-[10px]">
            {roleLabel}
          </Badge>
        </div>
        <form action={logout} className="ms-auto shrink-0">
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={t("logout")}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </>
  );
}

export async function DashboardShell({
  role,
  roleLabel,
  userName,
  title,
  description,
  children,
}: DashboardShellProps) {
  const initials = getInitials(userName);
  const t = await getTranslations("shell");
  const cookieStore = await cookies();
  const language = (cookieStore.get("locale")?.value as Language | undefined) ?? "EN";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip-to-content link — first focusable element */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside
        className="hidden h-screen w-64 shrink-0 flex-col border-e border-border bg-card lg:flex"
        aria-label="Sidebar navigation"
      >
        <SidebarContent
          role={role}
          userName={userName}
          roleLabel={roleLabel}
          t={t}
          initials={initials}
        />
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Topbar */}
        <header
          className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6"
          role="banner"
        >
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden"
                aria-label={t("openMenu")}
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>{t("appName")} Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <SidebarContent
                  role={role}
                  userName={userName}
                  roleLabel={roleLabel}
                  t={t}
                  initials={initials}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Page title */}
          <div className="flex min-w-0 flex-col">
            <h1 className="font-heading text-lg leading-tight text-primary sm:text-xl">{title}</h1>
            {description && (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {description}
              </p>
            )}
          </div>

          {/* Topbar actions */}
          <div className="ms-auto flex items-center gap-1" role="toolbar" aria-label="Page actions">
            <LanguageSwitcher current={language} />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label={t("notifications")}
            >
              <Bell className="size-4" aria-hidden="true" />
            </Button>
            <Avatar size="sm" className="ms-1 lg:hidden" aria-hidden="true">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 bg-muted/30 p-4 sm:p-6 animate-enter"
          role="main"
          aria-label={title}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
