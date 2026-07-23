import Link from "next/link";
import { BookOpenText, CheckCircle2 } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { RegisterForm } from "./register-form";

type Language = "EN" | "UR" | "AR";

const highlights = [
  "Live one-to-one & group classes with certified teachers",
  "Progress tracking across Nazra, Hifz, Tajweed & Tafseer",
  "Parent dashboards with attendance & homework updates",
  "100% free — forever, for everyone",
];

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");
  const cookieStore = await cookies();
  const language = (cookieStore.get("locale")?.value as Language | undefined) ?? "EN";

  return (
    <div className="relative flex min-h-full flex-1">
      {/* Language + theme controls */}
      <div className="absolute end-4 top-4 z-10 flex items-center gap-1">
        <LanguageSwitcher current={language} />
        <ThemeToggle />
      </div>
      {/* Form side */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-16 sm:px-10">
        <div className="w-full max-w-md">
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
          <RegisterForm />

          {/* Divider + switch */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{t("haveAccount")}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button asChild variant="outline" className="h-11 w-full rounded-xl">
              <Link href="/login">{t("signIn")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        {/* Background layers */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 85% 20%, oklch(1 0 0 / 0.08) 0%, transparent 50%),
              radial-gradient(circle at 15% 80%, oklch(1 0 0 / 0.05) 0%, transparent 50%)
            `,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Decorative rings */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -start-32 size-[500px] rounded-full border border-primary-foreground/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -start-16 size-[300px] rounded-full border border-primary-foreground/10"
        />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
            <BookOpenText className="size-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-lg">Quran Learning</span>
        </Link>

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="font-heading text-3xl text-primary-foreground/30">ٱقۡرَأۡ بِٱسۡمِ رَبِّكَ</p>
            <h2 className="font-heading text-3xl sm:text-4xl">
              Join thousands learning — for free, forever.
            </h2>
          </div>
          <ul className="flex flex-col gap-3" role="list">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-secondary"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/60">
          Available in English, Urdu, and Arabic — with full RTL support.
        </p>
      </div>
    </div>
  );
}
