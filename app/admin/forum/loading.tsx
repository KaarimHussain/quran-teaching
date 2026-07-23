import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function AdminForumLoading() {
  return (
    <DashboardLoadingShell navItemCount={6}>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </DashboardLoadingShell>
  );
}
