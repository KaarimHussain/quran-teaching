import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function ParentAttendanceLoading() {
  return (
    <DashboardLoadingShell navItemCount={6}>
      <div className="flex flex-col gap-4">
        <div className="h-10 animate-pulse rounded-xl bg-muted w-56" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
