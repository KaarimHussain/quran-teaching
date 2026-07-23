import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function ParentProgressLoading() {
  return (
    <DashboardLoadingShell navItemCount={6}>
      <div className="flex flex-col gap-4">
        <div className="h-10 animate-pulse rounded-xl bg-muted w-56" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
