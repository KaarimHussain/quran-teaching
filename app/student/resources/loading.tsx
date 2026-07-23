import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function StudentResourcesLoading() {
  return (
    <DashboardLoadingShell navItemCount={8}>
      <div className="flex flex-col gap-4">
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
