import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function TeacherForumLoading() {
  return (
    <DashboardLoadingShell navItemCount={7}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    </DashboardLoadingShell>
  );
}
