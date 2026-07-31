"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function QuranError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Quran Reader error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-md border-border text-center shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-7" />
          </div>
          <CardTitle className="font-heading text-2xl text-primary">
            Could Not Load This Surah
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            The Quran API may be temporarily unavailable or there was a network connection issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs font-mono text-muted-foreground/80 bg-muted p-2 rounded-md overflow-x-auto max-h-24">
            {error.message || "An unexpected error occurred."}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="w-full sm:w-auto rounded-full gap-2"
          >
            <RotateCcw className="size-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto rounded-full gap-2"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
