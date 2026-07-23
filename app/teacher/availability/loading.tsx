import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function TeacherAvailabilityLoading() {
  return (
    <DashboardLoadingShell navItemCount={7}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    </DashboardLoadingShell>
  );
}
