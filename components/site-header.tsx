import Link from "next/link";
import { BookOpenText, Menu } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

type Language = "EN" | "UR" | "AR";

export async function SiteHeader() {
  const [cookieStore, t] = await Promise.all([cookies(), getTranslations("marketing.header")]);
  const language = (cookieStore.get("locale")?.value as Language | undefined) ?? "EN";

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/courses", label: t("courses") },
    { href: "/#how-it-works", label: t("howItWorks") },
    { href: "/quran", label: t("quranReader") },
    { href: "/store", label: t("store") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpenText className="size-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-xl text-primary">Quran Learning</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher current={language} />
          <ThemeToggle />
          <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base">
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button asChild className="h-12 rounded-full px-6 text-base">
            <Link href="/register">{t("startFree")}</Link>
          </Button>
        </div>

        {/* Below lg: language, theme and a large-target menu */}
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher current={language} />
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-12 gap-2 rounded-full px-4 text-base" aria-label={t("openMenu")}>
                <Menu className="size-5" aria-hidden="true" />
                {t("menuTitle")}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 max-w-[85vw]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-heading text-lg text-primary">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BookOpenText className="size-4" aria-hidden="true" />
                  </span>
                  Quran Learning
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Main" className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex min-h-12 items-center rounded-xl px-4 text-lg font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-3 px-4">
                <Button asChild className="h-12 rounded-full text-base">
                  <Link href="/register">{t("startFree")}</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full text-base">
                  <Link href="/login">{t("login")}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
