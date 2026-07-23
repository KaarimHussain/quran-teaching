import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function ParentChildrenLoading() {
  return (
    <DashboardLoadingShell navItemCount={6}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </DashboardLoadingShell>
  );
}
