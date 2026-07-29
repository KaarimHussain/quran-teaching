"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { updateTeacherProfile } from "./actions";

const languageOptions = [
  { value: "EN", label: "English" },
  { value: "UR", label: "Urdu" },
  { value: "AR", label: "Arabic" },
];

type Props = {
  bio: string | null;
  teachingHoursLogged: number | null;
  verifiedLanguages: string[] | null;
  specialNeedsNote: string | null;
};

export function TeacherProfileForm({
  bio,
  teachingHoursLogged,
  verifiedLanguages,
  specialNeedsNote,
}: Props) {
  const [state, formAction, pending] = useActionState(updateTeacherProfile, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-bio">Bio</Label>
        <Textarea
          id="profile-bio"
          name="bio"
          defaultValue={bio ?? ""}
          placeholder="Introduce yourself — your background, teaching experience, specialisations…"
          className="min-h-28"
        />
        <p className="text-xs text-muted-foreground">
          Shown to students when they choose a preferred teacher.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-hours">Total Teaching Hours Logged</Label>
        <Input
          id="profile-hours"
          name="teachingHoursLogged"
          type="number"
          min={0}
          defaultValue={teachingHoursLogged ?? ""}
          placeholder="e.g. 500"
        />
        <p className="text-xs text-muted-foreground">
          Displayed on your public profile to build student trust.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Teaching Languages (verified)</legend>
        <div className="flex flex-wrap gap-3">
          {languageOptions.map((lang) => (
            <div key={lang.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`lang-${lang.value}`}
                name="verifiedLanguages"
                value={lang.value}
                defaultChecked={verifiedLanguages?.includes(lang.value) ?? false}
                className="size-4 accent-primary"
              />
              <label htmlFor={`lang-${lang.value}`} className="cursor-pointer text-sm">
                {lang.label}
              </label>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Languages you are comfortable teaching in.</p>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-special-needs">Special Needs Accommodation Notes</Label>
        <Textarea
          id="profile-special-needs"
          name="specialNeedsNote"
          defaultValue={specialNeedsNote ?? ""}
          placeholder="Describe any accommodations you offer for students with special needs…"
        />
        <p className="text-xs text-muted-foreground">
          Helps match students who require additional support.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Save className="size-4" /> {pending ? "Saving…" : "Save Profile"}
        </Button>
        {state?.success && (
          <p className="text-sm text-primary font-medium">Profile updated!</p>
        )}
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
