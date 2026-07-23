import { BookOpenText, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Props = {
  navItemCount?: number;
  children: React.ReactNode;
};

export function DashboardLoadingShell({ navItemCount = 5, children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar skeleton */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-e border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpenText className="size-5" />
          </span>
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        </div>
        <Separator />
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {Array.from({ length: navItemCount }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-full animate-pulse rounded-lg bg-muted"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
        <Separator />
        <div className="flex items-center gap-3 p-4">
          <div className="size-10 animate-pulse rounded-full bg-muted" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Topbar skeleton */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon" className="rounded-full lg:hidden" disabled>
            <Menu className="size-5" />
          </Button>
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="hidden h-3 w-60 animate-pulse rounded bg-muted sm:block" />
          </div>
          <div className="ms-auto flex items-center gap-2">
            <div className="size-8 animate-pulse rounded-full bg-muted" />
            <div className="size-8 animate-pulse rounded-full bg-muted" />
            <Button variant="ghost" size="icon" className="rounded-full" disabled>
              <Bell className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </header>

        <main className="flex-1 bg-muted/30 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
