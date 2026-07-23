import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendClassReminderEmail } from "@/lib/mailer";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Find sessions starting 15–30 min from now (cron runs every 15 min)
  const windowStart = new Date(now.getTime() + 15 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 30 * 60 * 1000);

  const sessions = await prisma.classSession.findMany({
    where: {
      status: "SCHEDULED",
      scheduledStart: { gte: windowStart, lte: windowEnd },
    },
    include: {
      course: { select: { name: true } },
      teacher: { select: { id: true, name: true, email: true } },
      participants: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  let notificationsCreated = 0;

  for (const session of sessions) {
    const recipients = [
      {
        id: session.teacher.id,
        name: session.teacher.name,
        email: session.teacher.email,
      },
      ...session.participants.map((p) => ({
        id: p.student.id,
        name: p.student.name,
        email: p.student.email,
      })),
    ];

    for (const recipient of recipients) {
      await prisma.notification.create({
        data: {
          userId: recipient.id,
          type: "CLASS_REMINDER",
          message: `Reminder: ${session.course.name} class starts in ~30 minutes.`,
        },
      });
      notificationsCreated++;

      void sendClassReminderEmail(
        recipient.email,
        recipient.name,
        session.course.name,
        session.scheduledStart,
        session.joinUrl
      );
    }
  }

  return NextResponse.json({
    sessionsProcessed: sessions.length,
    notificationsCreated,
  });
}
