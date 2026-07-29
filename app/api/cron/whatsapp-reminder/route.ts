import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage, classReminderMessage, whatsappEnabled } from "@/lib/whatsapp";

// Secured via CRON_SECRET Bearer token (same as progress-report cron)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!whatsappEnabled()) {
    return NextResponse.json({ skipped: true, reason: "WhatsApp not configured" });
  }

  // Sessions starting in the next 30–90 minutes
  const now = new Date();
  const windowStart = new Date(now.getTime() + 30 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 90 * 60 * 1000);

  const sessions = await prisma.classSession.findMany({
    where: {
      scheduledStart: { gte: windowStart, lte: windowEnd },
      status: "SCHEDULED",
    },
    include: {
      course: { select: { name: true } },
      participants: {
        include: {
          student: { select: { name: true, whatsappPhone: true } },
        },
      },
    },
  });

  let sent = 0;
  for (const session of sessions) {
    for (const p of session.participants) {
      const phone = p.student.whatsappPhone;
      if (!phone) continue;
      const msg = classReminderMessage(
        p.student.name,
        session.course.name,
        session.scheduledStart,
        session.joinUrl
      );
      await sendWhatsAppMessage(phone, msg);
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
