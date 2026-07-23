import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "./login-form";

type Language = "EN" | "UR" | "AR";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  const cookieStore = await cookies();
  const language = (cookieStore.get("locale")?.value as Language | undefined) ?? "EN";

  return (
    <div className="relative flex min-h-full flex-1">
      {/* Language + theme controls */}
      <div className="absolute end-4 top-4 z-10 flex items-center gap-1">
        <LanguageSwitcher current={language} />
        <ThemeToggle />
      </div>
      {/* Decorative panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        {/* Layered background textures */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 15%, oklch(1 0 0 / 0.08) 0%, transparent 50%),
              radial-gradient(circle at 85% 85%, oklch(1 0 0 / 0.05) 0%, transparent 50%)
            `,
          }}
        />
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Decorative ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -inset-e-32 size-125 rounded-full border border-primary-foreground/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -inset-e-16 size-75 rounded-full border border-primary-foreground/10"
        />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/20 backdrop-blur-sm">
            <BookOpenText className="size-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-lg">Quran Learning</span>
        </Link>

        <div className="relative flex flex-col gap-5">
          {/* Arabic Bismillah decoration */}
          <p className="font-heading text-3xl text-primary-foreground/30">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</p>
          <blockquote className="flex flex-col gap-3 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 px-7 py-6 backdrop-blur-sm">
            <p className="font-heading text-xl leading-relaxed sm:text-2xl">
              &ldquo;The best among you are those who learn the Quran and teach it.&rdquo;
            </p>
            <footer className="text-sm text-primary-foreground/60">
              &mdash; Prophet Muhammad ﷺ &nbsp;&middot;&nbsp; Sahih al-Bukhari 5027
            </footer>
          </blockquote>
        </div>

        <p className="relative text-sm text-primary-foreground/60">
          Welcome back to a peaceful place to pray, learn, and belong.
        </p>
      </div>

      {/* Form side */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookOpenText className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg text-primary">Quran Learning</span>
          </Link>

          {/* Heading */}
          <div className="mb-8 flex flex-col gap-1.5">
            <h1 className="font-heading text-2xl text-primary sm:text-3xl">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Divider + switch */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{t("noAccount")}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button asChild variant="outline" className="h-11 w-full rounded-xl">
              <Link href="/register">{t("register")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
