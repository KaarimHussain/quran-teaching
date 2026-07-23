import Link from "next/link";
import { BookOpenText, KeyRound } from "lucide-react";
import { ForgotForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full flex-1">
      {/* Decorative panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, oklch(1 0 0 / 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, oklch(1 0 0 / 0.05) 0%, transparent 50%)
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
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -end-32 size-[500px] rounded-full border border-primary-foreground/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -end-16 size-[300px] rounded-full border border-primary-foreground/10"
        />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
            <BookOpenText className="size-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-lg">Quran Learning</span>
        </Link>

        <div className="relative flex flex-col gap-5">
          <p className="font-heading text-3xl text-primary-foreground/30">وَمَا تَوۡفِيقِيٓ إِلَّا بِٱللَّهِ</p>
          <blockquote className="flex flex-col gap-3 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 px-7 py-6 backdrop-blur-sm">
            <p className="font-heading text-xl leading-relaxed sm:text-2xl">
              &ldquo;And my success is not but through Allah. Upon Him I have relied,
              and to Him I return.&rdquo;
            </p>
            <footer className="text-sm text-primary-foreground/60">
              &mdash; Surah Hud 11:88
            </footer>
          </blockquote>
        </div>

        <p className="relative text-sm text-primary-foreground/60">
          Forgot your password? No worries — we&apos;ll get you back in.
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
          <div className="mb-8 flex flex-col gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound className="size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-heading text-2xl text-primary sm:text-3xl">
                Forgot your password?
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter the email address linked to your account and we&apos;ll send you a
                reset link valid for <strong>1 hour</strong>.
              </p>
            </div>
          </div>

          <ForgotForm />
        </div>
      </div>
    </div>
  );
}
