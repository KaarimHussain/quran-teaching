import { CalendarClock, Clock, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
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
import { removeAvailability } from "./actions";
import { AvailabilityForm } from "./availability-form";

const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function TeacherAvailabilityPage() {
  const currentUser = await requireCurrentUser();
  const t = await getTranslations("pages.teacher");

  const availability = await prisma.teacherAvailability.findMany({
    where: { teacherUserId: currentUser.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const byDay = dayLabels.map((label, index) => ({
    label,
    slots: availability.filter((slot) => slot.dayOfWeek === index),
  }));

  return (
    <DashboardShell
      role="teacher"
      roleLabel={roleLabel[currentUser.role]}
      userName={currentUser.name}
      title={t("availability")}
      description={t("availabilityDesc")}
    >
      <div className="flex flex-col gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Add Availability</CardTitle>
            <CardDescription>Recurring weekly window — overlapping windows on the same day aren't allowed.</CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilityForm />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4" /> Weekly Schedule
            </CardTitle>
            <CardDescription>
              {availability.length === 0
                ? "No availability windows set yet."
                : `${availability.length} window${availability.length === 1 ? "" : "s"} across the week`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {byDay.map((day) => (
                <div key={day.label} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">{day.label}</span>
                  {day.slots.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Unavailable</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {day.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-primary"
                        >
                          <span className="flex items-center gap-1 text-xs font-medium">
                            <Clock className="size-3" /> {slot.startTime} – {slot.endTime}
                          </span>
                          <form action={removeAvailability}>
                            <input type="hidden" name="id" value={slot.id} />
                            <Button type="submit" size="icon" variant="ghost" className="size-5 rounded-full text-primary hover:text-destructive">
                              <X className="size-3" />
                            </Button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
