import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function StudentAssignmentsLoading() {
  return (
    <DashboardLoadingShell navItemCount={8}>
      <div className="flex flex-col gap-4">
        <div className="h-12 animate-pulse rounded-xl bg-muted w-2/3" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
