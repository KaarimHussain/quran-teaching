import { User, Clock, Globe, Heart } from "lucide-react";
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
import { TeacherProfileForm } from "./profile-form";

export default async function TeacherProfilePage() {
  const currentUser = await requireCurrentUser();
  if (currentUser.role !== "TEACHER") throw new Error("Forbidden");

  const teacher = await prisma.user.findUniqueOrThrow({
    where: { id: currentUser.id },
    select: {
      bio: true,
      teachingHoursLogged: true,
      verifiedLanguages: true,
      specialNeedsNote: true,
    },
  });

  const verifiedLanguages = Array.isArray(teacher.verifiedLanguages)
    ? (teacher.verifiedLanguages as string[])
    : null;

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title="My Profile"
      description="Manage your public profile, teaching languages, and accommodation notes."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4" /> Profile Details
              </CardTitle>
              <CardDescription>
                This information is visible to students when they browse or select a teacher.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeacherProfileForm
                bio={teacher.bio}
                teachingHoursLogged={teacher.teachingHoursLogged}
                verifiedLanguages={verifiedLanguages}
                specialNeedsNote={teacher.specialNeedsNote}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4" /> Teaching Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {teacher.teachingHoursLogged ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">total hours logged</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="size-4" /> Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verifiedLanguages && verifiedLanguages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {verifiedLanguages.map((l) => (
                    <span
                      key={l}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {l === "EN" ? "English" : l === "UR" ? "Urdu" : "Arabic"}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None set yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="size-4" /> Special Needs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {teacher.specialNeedsNote ?? "No accommodation notes added yet."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
