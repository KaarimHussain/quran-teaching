import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function AdminVerificationsLoading() {
  return (
    <DashboardLoadingShell navItemCount={6}>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </DashboardLoadingShell>
  );
}
