"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateLevelNotes, updateModuleCurriculum } from "./actions";

type SectionKey = "subjects" | "mandatoryLearning" | "practice" | "assessment";

const SECTIONS: SectionKey[] = ["subjects", "mandatoryLearning", "practice", "assessment"];

export function ModuleEditor({
  moduleId,
  values,
  isGated,
}: {
  moduleId: string;
  values: Record<SectionKey, string>;
  isGated: boolean;
}) {
  const t = useTranslations("pages.admin.curriculum");
  const [state, formAction, pending] = useActionState(updateModuleCurriculum, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="moduleId" value={moduleId} />
      <p className="text-xs text-muted-foreground">{t("onePerLine")}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {SECTIONS.map((key) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label htmlFor={`${moduleId}-${key}`}>{t(`sections.${key}`)}</Label>
            <Textarea
              id={`${moduleId}-${key}`}
              name={key}
              defaultValue={values[key]}
              className="min-h-28 text-sm"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox name="isGated" id={`${moduleId}-gated`} defaultChecked={isGated} />
          <Label htmlFor={`${moduleId}-gated`} className="font-normal">
            {t("gatedLabel")}
          </Label>
        </div>
        <Button type="submit" size="sm" disabled={pending} className="ms-auto rounded-full">
          <Save className="size-4" aria-hidden="true" />
          {pending ? t("saving") : t("save")}
        </Button>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.saved && !pending && <p className="text-sm text-primary">{t("saved")}</p>}
    </form>
  );
}

export function LevelNotesEditor({
  levelId,
  purpose,
  methodologyNote,
}: {
  levelId: string;
  purpose: string;
  methodologyNote: string;
}) {
  const t = useTranslations("pages.admin.curriculum");
  const [state, formAction, pending] = useActionState(updateLevelNotes, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="levelId" value={levelId} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${levelId}-purpose`}>{t("purpose")}</Label>
          <Textarea id={`${levelId}-purpose`} name="purpose" defaultValue={purpose} className="min-h-20 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${levelId}-methodology`}>{t("methodologyNote")}</Label>
          <Textarea
            id={`${levelId}-methodology`}
            name="methodologyNote"
            defaultValue={methodologyNote}
            className="min-h-20 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" variant="outline" disabled={pending} className="rounded-full">
          <Save className="size-4" aria-hidden="true" />
          {pending ? t("saving") : t("saveLevel")}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.saved && !pending && <p className="text-sm text-primary">{t("saved")}</p>}
      </div>
    </form>
  );
}
