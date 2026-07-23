"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { resetPassword } from "./actions";

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, undefined);

  // ── Success state ──
  if (state && "success" in state && state.success) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary/40 text-secondary-foreground">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl text-primary">Password updated!</h2>
            <p className="text-sm text-muted-foreground">
              Your password has been changed successfully. You can now sign in with
              your new password.
            </p>
          </div>
        </div>
        <Button asChild className="h-11 w-full rounded-xl text-sm font-semibold">
          <Link href="/login">
            Sign in <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Hidden token — passes the reset token through the form */}
      <input type="hidden" name="token" value={token} />

      {/* Global error (invalid / expired token) */}
      {state && "error" in state && state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span>{state.error}</span>
            <Link
              href="/forgot-password"
              className="font-medium underline underline-offset-4"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      )}

      {/* New password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password" className="text-sm font-medium">
          New Password
        </Label>
        <PasswordInput
          id="new-password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          aria-invalid={
            !!(state && "fieldErrors" in state && state.fieldErrors?.password)
          }
          aria-describedby={
            state && "fieldErrors" in state && state.fieldErrors?.password
              ? "new-password-error"
              : "new-password-hint"
          }
        />
        {state && "fieldErrors" in state && state.fieldErrors?.password ? (
          <p
            id="new-password-error"
            className="flex items-center gap-1 text-xs text-destructive"
          >
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.password[0]}
          </p>
        ) : (
          <p id="new-password-hint" className="text-xs text-muted-foreground">
            Use at least 8 characters with letters and numbers.
          </p>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-new-password" className="text-sm font-medium">
          Confirm New Password
        </Label>
        <PasswordInput
          id="confirm-new-password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          required
          aria-invalid={
            !!(
              state &&
              "fieldErrors" in state &&
              state.fieldErrors?.confirmPassword
            )
          }
          aria-describedby={
            state && "fieldErrors" in state && state.fieldErrors?.confirmPassword
              ? "confirm-new-password-error"
              : undefined
          }
        />
        {state && "fieldErrors" in state && state.fieldErrors?.confirmPassword && (
          <p
            id="confirm-new-password-error"
            className="flex items-center gap-1 text-xs text-destructive"
          >
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="mt-1 h-11 w-full rounded-xl text-sm font-semibold"
        disabled={pending}
      >
        {pending ? "Updating…" : "Update Password"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
