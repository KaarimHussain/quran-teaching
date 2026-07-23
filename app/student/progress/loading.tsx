import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function StudentProgressLoading() {
  return (
    <DashboardLoadingShell navItemCount={8}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
