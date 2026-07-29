import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/dal";
import { roleLabel } from "@/lib/roles";
import { StudentProfileForm } from "./profile-form";

export default async function StudentProfilePage() {
  const user = await requireCurrentUser();
  if (user.role !== "STUDENT") throw new Error("Forbidden");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, whatsappPhone: true },
  });

  return (
    <DashboardShell
      role="student"
      roleLabel={roleLabel[user.role]}
      userName={user.name}
      title="My Profile"
      description="Manage your contact details and notification preferences."
    >
      <div className="flex flex-col gap-6 max-w-lg">
        <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-5" />
          </div>
          <div>
            <p className="font-semibold">{profile?.name}</p>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Add your WhatsApp number to receive class reminders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentProfileForm whatsappPhone={profile?.whatsappPhone} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
