import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function TeacherAssignmentsLoading() {
  return (
    <DashboardLoadingShell navItemCount={7}>
      <div className="flex flex-col gap-4">
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
