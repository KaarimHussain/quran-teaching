import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function Loading() {
  return (
    <DashboardLoadingShell>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    </DashboardLoadingShell>
  );
}
