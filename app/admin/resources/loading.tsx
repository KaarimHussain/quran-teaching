import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function AdminResourcesLoading() {
  return (
    <DashboardLoadingShell navItemCount={9}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
