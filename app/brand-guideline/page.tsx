import { Button } from "@/components/ui/button";

type Swatch = {
  name: string;
  variable: string;
  className: string;
  textClassName?: string;
  value: string;
};

const colorGroups: { title: string; swatches: Swatch[] }[] = [
  {
    title: "Brand",
    swatches: [
      {
        name: "Primary",
        variable: "--primary",
        className: "bg-primary",
        textClassName: "text-primary-foreground",
        value: "oklch(0.34 0.055 165)",
      },
      {
        name: "Secondary",
        variable: "--secondary",
        className: "bg-secondary",
        textClassName: "text-secondary-foreground",
        value: "oklch(0.865 0.19 119)",
      },
      {
        name: "Accent",
        variable: "--accent",
        className: "bg-accent",
        textClassName: "text-accent-foreground",
        value: "oklch(0.79 0.13 80)",
      },
    ],
  },
  {
    title: "Surfaces",
    swatches: [
      {
        name: "Background",
        variable: "--background",
        className: "bg-background border border-border",
        textClassName: "text-foreground",
        value: "oklch(0.975 0.012 165)",
      },
      {
        name: "Card",
        variable: "--card",
        className: "bg-card border border-border",
        textClassName: "text-card-foreground",
        value: "oklch(1 0 0)",
      },
      {
        name: "Muted",
        variable: "--muted",
        className: "bg-muted",
        textClassName: "text-muted-foreground",
        value: "oklch(0.955 0.015 165)",
      },
      {
        name: "Border",
        variable: "--border",
        className: "bg-border",
        textClassName: "text-foreground",
        value: "oklch(0.91 0.018 165)",
      },
    ],
  },
  {
    title: "Text",
    swatches: [
      {
        name: "Foreground",
        variable: "--foreground",
        className: "bg-foreground",
        textClassName: "text-background",
        value: "oklch(0.24 0.035 165)",
      },
      {
        name: "Muted Foreground",
        variable: "--muted-foreground",
        className: "bg-muted-foreground",
        textClassName: "text-background",
        value: "oklch(0.52 0.025 165)",
      },
      {
        name: "Destructive",
        variable: "--destructive",
        className: "bg-destructive",
        textClassName: "text-white",
        value: "oklch(0.577 0.245 27.325)",
      },
    ],
  },
  {
    title: "Charts",
    swatches: [
      { name: "Chart 1", variable: "--chart-1", className: "bg-chart-1", textClassName: "text-primary-foreground", value: "oklch(0.34 0.055 165)" },
      { name: "Chart 2", variable: "--chart-2", className: "bg-chart-2", textClassName: "text-secondary-foreground", value: "oklch(0.865 0.19 119)" },
      { name: "Chart 3", variable: "--chart-3", className: "bg-chart-3", textClassName: "text-accent-foreground", value: "oklch(0.79 0.13 80)" },
      { name: "Chart 4", variable: "--chart-4", className: "bg-chart-4", textClassName: "text-background", value: "oklch(0.52 0.025 165)" },
      { name: "Chart 5", variable: "--chart-5", className: "bg-chart-5", textClassName: "text-background", value: "oklch(0.24 0.035 165)" },
    ],
  },
];

function ColorSwatch({ swatch }: { swatch: Swatch }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className={`h-20 w-full rounded-xl flex items-end p-3 ${swatch.className} ${swatch.textClassName ?? ""}`}>
        <span className="text-xs font-medium opacity-80">{swatch.value}</span>
      </div>
      <div>
        <p className="font-semibold text-sm">{swatch.name}</p>
        <p className="text-xs text-muted-foreground font-mono">{swatch.variable}</p>
      </div>
    </div>
  );
}

export default function BrandGuidelinePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 flex flex-col gap-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold tracking-widest uppercase text-secondary-foreground bg-secondary inline-block w-fit px-3 py-1 rounded-full">
          Brand Guideline
        </p>
        <h1 className="text-4xl md:text-5xl font-heading text-primary">
          A Peaceful Place to Pray, Learn, and Belong
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl">
          The visual identity for the Quran Learning platform &mdash; colors, typography, and
          core components used across the website.
        </p>
      </header>

      {/* Colors */}
      <section className="flex flex-col gap-8">
        <h2 className="text-2xl md:text-3xl font-heading text-primary">Color Palette</h2>
        {colorGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">{group.title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {group.swatches.map((swatch) => (
                <ColorSwatch key={swatch.variable} swatch={swatch} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Typography */}
      <section className="flex flex-col gap-8">
        <h2 className="text-2xl md:text-3xl font-heading text-primary">Typography</h2>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Heading &mdash; Cinzel Decorative
          </p>
          <h1 className="text-5xl font-heading">Heading 1 / Aa Quran</h1>
          <h2 className="text-4xl font-heading">Heading 2 / Aa Quran</h2>
          <h3 className="text-3xl font-heading">Heading 3 / Aa Quran</h3>
          <h4 className="text-2xl font-heading">Heading 4 / Aa Quran</h4>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Body &mdash; Montserrat
          </p>
          <p className="text-xl font-sans font-bold">
            Bold &mdash; Lorem ipsum is simply dummy text of the printing and typesetting industry.
          </p>
          <p className="text-lg font-sans font-semibold">
            Semibold &mdash; Lorem ipsum is simply dummy text of the printing and typesetting industry.
          </p>
          <p className="text-base font-sans font-medium">
            Medium &mdash; Lorem ipsum is simply dummy text of the printing and typesetting industry.
          </p>
          <p className="text-base font-sans font-normal">
            Regular &mdash; Lorem ipsum is simply dummy text of the printing and typesetting industry.
            Lorem ipsum has been the industry&apos;s standard.
          </p>
          <p className="text-sm font-sans font-light text-muted-foreground">
            Light &mdash; Lorem ipsum is simply dummy text of the printing and typesetting industry.
          </p>
        </div>
      </section>

      {/* Buttons */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-heading text-primary">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-6">
          <Button className="rounded-full">Discover More</Button>
          <Button variant="secondary" className="rounded-full">
            Listen Holy Quran
          </Button>
          <Button variant="outline" className="rounded-full">
            Sign Up
          </Button>
          <Button variant="ghost" className="rounded-full">
            Ghost
          </Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive" className="rounded-full">
            Destructive
          </Button>
        </div>
      </section>
    </main>
  );
}
