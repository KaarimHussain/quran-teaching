"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CloudOff, Home, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// Catches errors thrown while rendering any page below the root layout —
// most commonly the database being unreachable. Server error details are
// redacted in production, so this stays generic and shows the digest for
// matching against server logs.
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations("common.errorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center bg-background px-4 py-16">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CloudOff className="size-7" aria-hidden="true" />
        </span>
        <h1 className="font-heading text-2xl text-primary sm:text-3xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("description")}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => unstable_retry()} className="rounded-full px-6">
            <RotateCw className="size-4" aria-hidden="true" />
            {t("retry")}
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              {t("home")}
            </Link>
          </Button>
        </div>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            {t("reference", { digest: error.digest })}
          </p>
        )}
      </div>
    </main>
  );
}
