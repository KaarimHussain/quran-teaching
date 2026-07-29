"use client";

import { useActionState } from "react";
import { Phone, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStudentProfile } from "./actions";

export function StudentProfileForm({
  whatsappPhone,
}: {
  whatsappPhone?: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateStudentProfile, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label className="flex items-center gap-2">
          <Phone className="size-3.5" /> WhatsApp Number
        </Label>
        <Input
          name="whatsappPhone"
          type="tel"
          placeholder="+44 7700 900000"
          defaultValue={whatsappPhone ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Include country code (e.g. +44). Used to send class reminders via WhatsApp.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          <Save className="size-4" />
          {pending ? "Saving…" : "Save Profile"}
        </Button>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-600">Profile saved!</p>}
      </div>
    </form>
  );
}
