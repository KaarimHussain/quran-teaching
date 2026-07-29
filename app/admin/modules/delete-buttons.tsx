"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCourseModule, deleteModuleContent } from "./actions";

export function DeleteModuleButton({ moduleId }: { moduleId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-destructive hover:text-destructive"
      onClick={() => {
        if (confirm("Delete this module and all its content?")) {
          deleteCourseModule(moduleId);
        }
      }}
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}

export function DeleteContentButton({ contentId }: { contentId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-6 text-destructive hover:text-destructive"
      onClick={() => deleteModuleContent(contentId)}
    >
      <Trash2 className="size-3" />
    </Button>
  );
}
