import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";

export default async function SubscribeSuccessPage() {
  const user = await requireCurrentUser();

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="Subscription Confirmed"
      description=""
    >
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <CheckCircle2 className="size-16 text-green-500" />
        <h2 className="font-heading text-2xl text-primary">JazakAllah Khair!</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your subscription has been activated. You now have full access to live classes.
        </p>
        <Button asChild className="rounded-full px-6">
          <Link href="/student">Go to Dashboard</Link>
        </Button>
      </div>
    </DashboardShell>
  );
}
