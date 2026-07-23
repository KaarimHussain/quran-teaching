"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const t = useTranslations("auth.login");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Global error banner */}
      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email" className="text-sm font-medium">
          {t("email")}
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            required
            aria-invalid={!!state?.fieldErrors?.email}
            aria-describedby={state?.fieldErrors?.email ? "login-email-error" : undefined}
            className="h-11 rounded-xl ps-10"
          />
        </div>
        {state?.fieldErrors?.email && (
          <p id="login-email-error" className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-sm font-medium">
            {t("password")}
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          required
          aria-invalid={!!state?.fieldErrors?.password}
          aria-describedby={state?.fieldErrors?.password ? "login-password-error" : undefined}
        />
        {state?.fieldErrors?.password && (
          <p id="login-password-error" className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <Button type="submit" className="mt-1 h-11 w-full rounded-xl text-sm font-semibold" disabled={pending}>
        {pending ? t("submitting") : t("submit")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
