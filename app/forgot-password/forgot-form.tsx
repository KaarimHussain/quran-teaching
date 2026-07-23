"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Mail, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "./actions";
import { useState } from "react";

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);
  const [copied, setCopied] = useState(false);

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Success state ──
  if (state && "success" in state && state.success) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary/40 text-secondary-foreground">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl text-primary">Check your inbox</h2>
            <p className="text-sm text-muted-foreground">
              If an account with that email exists, a password reset link has been sent.
              It expires in <strong>1 hour</strong>.
            </p>
          </div>
        </div>

        {/* Dev-mode link — only rendered when NODE_ENV !== production */}
        {state.devLink && (
          <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-50/60 p-4 dark:bg-amber-950/20">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
              Development mode — email not sent
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
              Configure <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">SMTP_HOST</code> in your{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env</code> to enable real email delivery.
              Use this link to test the reset flow:
            </p>
            <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-amber-300/50 bg-white/70 p-2 dark:bg-black/20">
              <code className="min-w-0 flex-1 truncate text-[11px] text-amber-800 dark:text-amber-300">
                {state.devLink}
              </code>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => copyLink(state.devLink!)}
                  aria-label="Copy reset link"
                  className="rounded-md p-1.5 text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900"
                >
                  {copied ? (
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="size-3.5" aria-hidden="true" />
                  )}
                </button>
                <a
                  href={state.devLink}
                  aria-label="Open reset link"
                  className="rounded-md p-1.5 text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900"
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        )}

        <Button asChild variant="outline" className="h-11 w-full rounded-xl">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  // ── Form state ──
  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state && "error" in state && state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgot-email" className="text-sm font-medium">
          Email address
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-invalid={
              !!(state && "fieldErrors" in state && state.fieldErrors?.email)
            }
            aria-describedby={
              state && "fieldErrors" in state && state.fieldErrors?.email
                ? "forgot-email-error"
                : undefined
            }
            className="h-11 rounded-xl ps-10"
          />
        </div>
        {state && "fieldErrors" in state && state.fieldErrors?.email && (
          <p
            id="forgot-email-error"
            className="flex items-center gap-1 text-xs text-destructive"
          >
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-xl text-sm font-semibold"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send Reset Link"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>

      <Button asChild variant="ghost" className="h-11 w-full rounded-xl text-sm">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </form>
  );
}
