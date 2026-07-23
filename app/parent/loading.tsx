import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function ParentDashboardLoading() {
  return (
    <DashboardLoadingShell navItemCount={6}>
      <div className="flex flex-col gap-6">
        <div className="h-10 animate-pulse rounded-xl bg-muted w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-xl bg-muted lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
