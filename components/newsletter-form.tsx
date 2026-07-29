"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewsletterForm({ language = "EN" }: { language?: "EN" | "UR" | "AR" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm font-medium text-primary">
        Subscribed! JazakAllahu Khairan — you&apos;ll hear from us soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newsletter-email" className="text-sm">
          Stay updated — subscribe to our newsletter
        </Label>
        <div className="flex gap-2">
          <Input
            id="newsletter-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={status === "loading"} className="shrink-0">
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </Button>
        </div>
      </div>
      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
      <p className="text-xs text-muted-foreground">
        No spam. Unsubscribe anytime. We respect your privacy.
      </p>
    </form>
  );
}
