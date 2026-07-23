import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.classSession.updateMany({
    where: {
      status: "LIVE",
      scheduledEnd: { lt: now },
    },
    data: { status: "COMPLETED", joinUrl: null },
  });

  return NextResponse.json({ completed: result.count });
}
