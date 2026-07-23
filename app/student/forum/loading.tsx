import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function StudentForumLoading() {
  return (
    <DashboardLoadingShell navItemCount={8}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="h-14 animate-pulse rounded-xl bg-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-xl bg-muted" />
      </div>
    </DashboardLoadingShell>
  );
}
