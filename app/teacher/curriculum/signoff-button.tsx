"use client";

import { useActionState } from "react";
import { CheckCircle2, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revokeSignOff, signOffModule } from "./actions";

type Props = { studentUserId: string; moduleId: string };

export function SignOffForm({ studentUserId, moduleId }: Props) {
  const t = useTranslations("pages.teacher.curriculum");
  const [state, formAction, pending] = useActionState(signOffModule, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="studentUserId" value={studentUserId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <Input name="notes" placeholder={t("notesPlaceholder")} className="h-8 min-w-48 flex-1 text-sm" />
      <Button type="submit" size="sm" disabled={pending} className="rounded-full">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        {pending ? t("saving") : t("signOff")}
      </Button>
      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

export function RevokeForm({ studentUserId, moduleId }: Props) {
  const t = useTranslations("pages.teacher.curriculum");
  const [state, formAction, pending] = useActionState(revokeSignOff, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="studentUserId" value={studentUserId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending} className="rounded-full">
        <Undo2 className="size-4" aria-hidden="true" />
        {pending ? t("saving") : t("revoke")}
      </Button>
      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
