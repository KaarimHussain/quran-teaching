"use client";

import dynamic from "next/dynamic";

// recharts is a large client-only dependency. Loading the charts lazily keeps it
// out of the admin pages' initial JS so the page becomes interactive first and
// the charts stream in afterwards. Placeholders match each chart's height to
// avoid layout shift.

export const EnrollmentChart = dynamic(
  () => import("./enrollment-chart").then((m) => m.EnrollmentChart),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse rounded-lg bg-muted" /> }
);

export const DistributionPieChart = dynamic(
  () => import("./distribution-pie-chart").then((m) => m.DistributionPieChart),
  { ssr: false, loading: () => <div className="mx-auto h-48 w-full animate-pulse rounded-lg bg-muted" /> }
);
