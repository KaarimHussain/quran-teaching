import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function AdminCoursesLoading() {
  return (
    <DashboardLoadingShell navItemCount={6}>
      <div className="flex flex-col gap-6">
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
