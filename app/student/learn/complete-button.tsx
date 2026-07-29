"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markContentComplete } from "./actions";

export function CompleteButton({
  contentId,
  done,
}: {
  contentId: string;
  done: boolean;
}) {
  if (done) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
        <CheckCircle2 className="size-4" /> Completed
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="rounded-full text-xs"
      onClick={() => markContentComplete(contentId)}
    >
      Mark as Complete
    </Button>
  );
}
