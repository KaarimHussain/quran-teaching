"use client";

import { useActionState } from "react";
import { ArrowRight, AlertCircle, GraduationCap, BookOpenCheck, Heart, Mail, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password-input";
import { register } from "@/app/actions/auth";

const languages = [
  { value: "EN", label: "English" },
  { value: "UR", label: "اردو" },
  { value: "AR", label: "العربية" },
];

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined);
  const t = useTranslations("auth.register");

  const roles = [
    { value: "STUDENT", label: t("student"), icon: GraduationCap, description: "I want to learn" },
    { value: "TEACHER", label: t("teacher"), icon: BookOpenCheck, description: "I want to teach" },
    { value: "PARENT", label: t("parent"), icon: Heart, description: "My child is learning" },
  ];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Global error */}
      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Role */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">{t("joiningAs")}</legend>
        <div className="grid grid-cols-3 gap-2">
          {roles.map((role, index) => (
            <div key={role.value}>
              <input
                type="radio"
                name="role"
                id={`role-${role.value}`}
                value={role.value}
                defaultChecked={index === 0}
                className="peer sr-only"
              />
              <label
                htmlFor={`role-${role.value}`}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-border bg-muted/30 px-2 py-3.5 text-center transition-all hover:border-primary/40 hover:bg-primary/5 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground">
                  <role.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold leading-tight">{role.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{role.description}</span>
              </label>
            </div>
          ))}
        </div>
        {state?.fieldErrors?.role && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.role[0]}
          </p>
        )}
      </fieldset>

      <div className="h-px bg-border/60" role="separator" />

      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg-name" className="text-sm font-medium">
          {t("fullName")}
        </Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            required
            aria-invalid={!!state?.fieldErrors?.name}
            aria-describedby={state?.fieldErrors?.name ? "reg-name-error" : undefined}
            className="h-11 rounded-xl ps-10"
          />
        </div>
        {state?.fieldErrors?.name && (
          <p id="reg-name-error" className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg-email" className="text-sm font-medium">
          {t("email")}
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            required
            aria-invalid={!!state?.fieldErrors?.email}
            aria-describedby={state?.fieldErrors?.email ? "reg-email-error" : undefined}
            className="h-11 rounded-xl ps-10"
          />
        </div>
        {state?.fieldErrors?.email && (
          <p id="reg-email-error" className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg-password" className="text-sm font-medium">
          {t("password")}
        </Label>
        <PasswordInput
          id="reg-password"
          name="password"
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          required
          aria-invalid={!!state?.fieldErrors?.password}
          aria-describedby={state?.fieldErrors?.password ? "reg-password-error" : "reg-password-hint"}
        />
        {state?.fieldErrors?.password ? (
          <p id="reg-password-error" className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.password[0]}
          </p>
        ) : (
          <p id="reg-password-hint" className="text-xs text-muted-foreground">
            Use at least 8 characters with letters and numbers.
          </p>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg-confirm-password" className="text-sm font-medium">
          {t("confirm")}
        </Label>
        <PasswordInput
          id="reg-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          required
          aria-invalid={!!state?.fieldErrors?.confirmPassword}
          aria-describedby={state?.fieldErrors?.confirmPassword ? "reg-confirm-error" : undefined}
        />
        {state?.fieldErrors?.confirmPassword && (
          <p id="reg-confirm-error" className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      <div className="h-px bg-border/60" role="separator" />

      {/* Language */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">{t("preferredLanguage")}</legend>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((lang, index) => (
            <div key={lang.value}>
              <input
                type="radio"
                name="language"
                id={`lang-${lang.value}`}
                value={lang.value}
                defaultChecked={index === 0}
                className="peer sr-only"
              />
              <label
                htmlFor={`lang-${lang.value}`}
                className="flex cursor-pointer items-center justify-center rounded-xl border border-border bg-muted/30 px-2 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:bg-primary/5 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50"
              >
                {lang.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Terms */}
      <div className="flex items-start gap-2.5">
        <Checkbox
          id="terms"
          name="terms"
          className="mt-0.5 shrink-0"
          required
          aria-describedby={state?.fieldErrors?.terms ? "terms-error" : undefined}
        />
        <Label htmlFor="terms" className="text-xs font-normal leading-relaxed text-muted-foreground">
          {t("terms")}
        </Label>
      </div>
      {state?.fieldErrors?.terms && (
        <p id="terms-error" className="-mt-2 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
          {state.fieldErrors.terms[0]}
        </p>
      )}

      <Button type="submit" className="mt-1 h-11 w-full rounded-xl text-sm font-semibold" disabled={pending}>
        {pending ? t("submitting") : t("submit")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
