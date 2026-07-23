import Link from "next/link";
import { BookOpenText, Bell, LogOut, Menu } from "lucide-react";
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
  language?: Language;
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

export async function DashboardShell({
  role,
  roleLabel,
  userName,
  language = "EN",
  title,
  description,
  children,
}: DashboardShellProps) {
  const initials = getInitials(userName);
  const t = await getTranslations("shell");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-e border-border bg-card lg:flex">
        <Link href="/" className="flex h-16 items-center gap-2 px-5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpenText className="size-5" />
          </span>
          <span className="font-heading text-lg text-primary">{t("appName")}</span>
        </Link>
        <Separator />
        <div className="flex-1 overflow-y-auto p-3">
          <DashboardNav role={role} />
        </div>
        <Separator />
        <div className="flex items-center gap-3 p-4">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{userName}</span>
            <Badge variant="secondary" className="mt-0.5 w-fit rounded-full text-[10px]">
              {roleLabel}
            </Badge>
          </div>
          <form action={logout} className="ms-auto">
            <Button type="submit" variant="ghost" size="icon" className="rounded-full" aria-label={t("logout")}>
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label={t("openMenu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-heading text-primary">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BookOpenText className="size-4" />
                  </span>
                  {t("appName")}
                </SheetTitle>
              </SheetHeader>
              <div className="px-3">
                <DashboardNav role={role} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex flex-col">
            <h1 className="font-heading text-lg leading-tight text-primary sm:text-xl">{title}</h1>
            {description && (
              <p className="hidden text-xs text-muted-foreground sm:block">{description}</p>
            )}
          </div>

          <div className="ms-auto flex items-center gap-1">
            <LanguageSwitcher current={language} />
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("notifications")}>
              <Bell className="size-4" />
            </Button>
            <Avatar size="sm" className="ms-1 lg:hidden">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 bg-muted/30 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
