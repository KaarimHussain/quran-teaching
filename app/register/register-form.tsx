"use client";

import { useActionState } from "react";
import { ArrowRight, GraduationCap, BookOpenCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { register } from "@/app/actions/auth";

const roles = [
  { value: "STUDENT", label: "Student", icon: GraduationCap },
  { value: "TEACHER", label: "Teacher", icon: BookOpenCheck },
  { value: "PARENT", label: "Parent", icon: Heart },
];

const languages = [
  { value: "EN", label: "English" },
  { value: "UR", label: "اردو" },
  { value: "AR", label: "العربية" },
];

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Role selection */}
      <fieldset className="flex flex-col gap-2">
        <Label className="text-sm">I am joining as a&hellip;</Label>
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
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-border px-2 py-3 text-center transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50"
              >
                <role.icon className="size-5 text-primary" />
                <span className="text-xs font-medium">{role.label}</span>
              </label>
            </div>
          ))}
        </div>
        {state?.fieldErrors?.role && (
          <p className="text-xs text-destructive">{state.fieldErrors.role[0]}</p>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Your full name"
          required
          aria-invalid={!!state?.fieldErrors?.name}
        />
        {state?.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          aria-invalid={!!state?.fieldErrors?.email}
        />
        {state?.fieldErrors?.email && (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            aria-invalid={!!state?.fieldErrors?.password}
          />
          {state?.fieldErrors?.password && (
            <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">Confirm</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            aria-invalid={!!state?.fieldErrors?.confirmPassword}
          />
          {state?.fieldErrors?.confirmPassword && (
            <p className="text-xs text-destructive">{state.fieldErrors.confirmPassword[0]}</p>
          )}
        </div>
      </div>

      {/* Language selection */}
      <fieldset className="flex flex-col gap-2">
        <Label className="text-sm">Preferred Language</Label>
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
                className="flex cursor-pointer items-center justify-center rounded-xl border border-border px-2 py-2 text-sm font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50"
              >
                {lang.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex items-start gap-2">
        <Checkbox id="terms" name="terms" className="mt-0.5" required />
        <Label htmlFor="terms" className="text-xs font-normal text-muted-foreground">
          I agree to learn and teach with sincerity, respect, and patience, following
          the Quran Learning community guidelines.
        </Label>
      </div>
      {state?.fieldErrors?.terms && (
        <p className="text-xs text-destructive">{state.fieldErrors.terms[0]}</p>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="mt-1 w-full rounded-full" disabled={pending}>
        {pending ? "Creating account…" : "Create Account"} <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
