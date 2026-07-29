import Link from "next/link";
import { CalendarDays, ExternalLink, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewsletterForm } from "@/components/newsletter-form";
import { prisma } from "@/lib/db";

const languageLabel: Record<string, string> = { EN: "English", UR: "Urdu", AR: "Arabic" };

export const metadata = { title: "Events & Webinars — Quran Learning" };

export default async function EventsPage() {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.publicEvent.findMany({
      where: { isPublished: true, scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      include: { host: { select: { name: true } } },
    }),
    prisma.publicEvent.findMany({
      where: { isPublished: true, scheduledAt: { lt: now } },
      orderBy: { scheduledAt: "desc" },
      take: 6,
      include: { host: { select: { name: true } } },
    }),
  ]);

  function EventCard({ event }: { event: typeof upcoming[0] }) {
    const dateStr = new Date(event.scheduledAt).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeStr = new Date(event.scheduledAt).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Card className="border-border/80">
        <CardHeader>
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {dateStr} at {timeStr}
            </span>
            <span>·</span>
            <span>hosted by {event.host.name}</span>
            <Badge variant="outline" className="rounded-full gap-1 py-0 text-xs">
              <Globe className="size-3" /> {languageLabel[event.language]}
            </Badge>
          </div>
          <CardTitle className="text-lg">{event.title}</CardTitle>
          {event.description && (
            <CardDescription className="text-sm leading-relaxed">
              {event.description}
            </CardDescription>
          )}
          {event.joinUrl && new Date(event.scheduledAt) >= now && (
            <div className="pt-2">
              <Button asChild size="sm" className="rounded-full gap-1">
                <a href={event.joinUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" /> Join Event
                </a>
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="font-heading text-3xl text-primary">Webinars & Events</h1>
        <p className="text-muted-foreground">
          Free public workshops and webinars — open to everyone, no enrollment required.
        </p>
        <div className="mt-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign in to enroll in full courses</Link>
          </Button>
        </div>
      </div>

      {upcoming.length > 0 && (
        <section className="mb-10 flex flex-col gap-4">
          <h2 className="font-heading text-xl text-primary">Upcoming</h2>
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="mb-10 flex flex-col gap-4">
          <h2 className="font-heading text-xl text-muted-foreground">Past Events</h2>
          {past.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-sm text-muted-foreground">No events scheduled yet. Check back soon.</p>
      )}

      <div className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
        <NewsletterForm />
      </div>
    </main>
  );
}
