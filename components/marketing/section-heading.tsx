import { cn } from "@/lib/utils";

/** Eyebrow + display H2 + optional intro, sized for comfortable reading. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  id,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "center" | "start";
  id?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-start"
      )}
    >
      {eyebrow && (
        <p className="text-base font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      )}
      <h2 id={id} className="max-w-3xl font-heading text-3xl leading-tight text-primary sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">{intro}</p>}
    </div>
  );
}
