"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLanguage } from "@/app/actions/preferences";

const languages = [
  { value: "EN", label: "English", dir: "ltr" },
  { value: "UR", label: "اردو", dir: "rtl" },
  { value: "AR", label: "العربية", dir: "rtl" },
] as const;

type Language = "EN" | "UR" | "AR";

export function LanguageSwitcher({ current }: { current: Language }) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(lang: Language) {
    const fd = new FormData();
    fd.set("language", lang);
    startTransition(() => setLanguage(fd));
  }

  const currentLabel = languages.find((l) => l.value === current)?.label ?? "EN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 rounded-full" disabled={isPending}>
          <Globe className="size-4" />
          <span className="text-xs">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onSelect={() => handleSelect(lang.value)}
            className={current === lang.value ? "font-medium text-primary" : ""}
          >
            <span dir={lang.dir}>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
