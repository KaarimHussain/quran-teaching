import Link from "next/link";
import { BookOpenText, KeyRound, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { ResetForm } from "./reset-form";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  // ── Validate the token before rendering the form ──
  const tokenValid =
    !!token &&
    !!(await prisma.passwordResetToken.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    }));

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
          <p className="font-heading text-3xl text-primary-foreground/30">حَسۡبُنَا ٱللَّهُ وَنِعۡمَ ٱلۡوَكِيلُ</p>
          <blockquote className="flex flex-col gap-3 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 px-7 py-6 backdrop-blur-sm">
            <p className="font-heading text-xl leading-relaxed sm:text-2xl">
              &ldquo;Allah is sufficient for us, and He is the best Disposer of affairs.&rdquo;
            </p>
            <footer className="text-sm text-primary-foreground/60">
              &mdash; Surah Al-Imran 3:173
            </footer>
          </blockquote>
        </div>

        <p className="relative text-sm text-primary-foreground/60">
          Almost there — choose a strong new password to secure your account.
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

          {tokenValid ? (
            <>
              {/* Valid token — show password form */}
              <div className="mb-8 flex flex-col gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <KeyRound className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h1 className="font-heading text-2xl text-primary sm:text-3xl">
                    Set a new password
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Choose a strong password with at least 8 characters including
                    letters and numbers.
                  </p>
                </div>
              </div>
              <ResetForm token={token!} />
            </>
          ) : (
            /* Invalid / expired / missing token */
            <div className="flex flex-col items-center gap-5 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="size-7" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h1 className="font-heading text-2xl text-primary">Link expired</h1>
                <p className="text-sm text-muted-foreground">
                  This password reset link is invalid, has already been used, or
                  expired. Reset links are only valid for <strong>1 hour</strong>.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3">
                <Button asChild className="h-11 w-full rounded-xl text-sm font-semibold">
                  <Link href="/forgot-password">Request a new link</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 w-full rounded-xl">
                  <Link href="/login">Back to sign in</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
