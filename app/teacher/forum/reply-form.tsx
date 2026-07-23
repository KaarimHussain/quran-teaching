"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createForumReply } from "./actions";

export function ReplyForm({ postId }: { postId: string }) {
  return (
    <form action={createForumReply} className="flex items-center gap-2">
      <input type="hidden" name="postId" value={postId} />
      <Input name="body" placeholder="Write a reply..." required className="flex-1" />
      <Button type="submit" size="sm" variant="outline" className="rounded-full">
        <Send className="size-3.5" /> Reply
      </Button>
    </form>
  );
}
