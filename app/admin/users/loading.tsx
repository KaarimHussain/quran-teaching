import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function AdminUsersLoading() {
  return (
    <DashboardLoadingShell navItemCount={6}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
