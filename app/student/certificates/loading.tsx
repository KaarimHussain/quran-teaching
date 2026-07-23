import { DashboardLoadingShell } from "@/components/dashboard/dashboard-loading-shell";

export default function StudentCertificatesLoading() {
  return (
    <DashboardLoadingShell navItemCount={8}>
      <div className="flex flex-col gap-6">
        <div className="h-52 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
