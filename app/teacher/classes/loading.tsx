import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function TeacherClassesLoading() {
  return (
    <DashboardLoadingShell navItemCount={7}>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </DashboardLoadingShell>
  );
}
