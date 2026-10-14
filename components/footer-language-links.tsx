"use client";

import { useTransition } from "react";
import { setLanguage } from "@/app/actions/preferences";

const languages = [
  { value: "EN", label: "English", lang: "en" },
  { value: "UR", label: "اردو", lang: "ur" },
  { value: "AR", label: "العربية", lang: "ar" },
] as const;

type Language = (typeof languages)[number]["value"];

/** Footer language list — same switching mechanism as LanguageSwitcher. */
export function FooterLanguageLinks({ current }: { current: Language }) {
  const [isPending, startTransition] = useTransition();

  function choose(value: Language) {
    const fd = new FormData();
    fd.set("language", value);
    startTransition(async () => {
      await setLanguage(fd);
      window.location.reload();
    });
  }

  return (
    <ul className="flex flex-col gap-2">
      {languages.map((l) => (
        <li key={l.value}>
          <button
            type="button"
            lang={l.lang}
            disabled={isPending}
            aria-current={current === l.value ? "true" : undefined}
            onClick={() => choose(l.value)}
            className="min-h-10 text-start text-base text-muted-foreground transition-colors hover:text-primary aria-[current=true]:font-semibold aria-[current=true]:text-foreground disabled:opacity-60"
          >
            {l.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
