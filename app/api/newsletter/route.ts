import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, language } = body;

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const validLanguages = ["EN", "UR", "AR"];
    const resolvedLanguage =
      typeof language === "string" && validLanguages.includes(language)
        ? (language as "EN" | "UR" | "AR")
        : "EN";

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, language: resolvedLanguage },
      create: { email, language: resolvedLanguage },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
