# Brand Guidelines

Visual identity for the Quran Learning platform. A live, interactive version of this
document is available at the `/brand-guideline` route.

## Brand Personality

A peaceful, welcoming place to pray, learn, and belong — calm greens evoke mosques and
nature, lime accents add warmth and energy, and gold accents add a touch of elegance and
tradition.

## Color Palette

Colors are defined as CSS variables in `app/globals.css` (`:root` for light mode, `.dark`
for dark mode) and consumed via Tailwind utilities (`bg-primary`, `text-primary-foreground`,
etc.). Always use the tokens below instead of hardcoded hex/oklch values.

### Brand Colors

| Token | Light value | Usage |
| --- | --- | --- |
| `primary` / `primary-foreground` | `oklch(0.34 0.055 165)` (deep forest green) on `oklch(0.98 0.01 120)` | Headings, primary buttons (e.g. "Discover More"), top bar, key brand moments |
| `secondary` / `secondary-foreground` | `oklch(0.865 0.19 119)` (lime green) on `oklch(0.28 0.05 165)` | Logo mark, "Listen Holy Quran" / "Sign Up" buttons, highlights |
| `accent` / `accent-foreground` | `oklch(0.79 0.13 80)` (gold) on `oklch(0.28 0.06 60)` | Decorative borders/frames, ornamental accents |

### Surfaces

| Token | Light value | Usage |
| --- | --- | --- |
| `background` | `oklch(0.975 0.012 165)` (mint-tinted off-white) | Page background |
| `card` / `card-foreground` | `oklch(1 0 0)` on foreground | Cards, panels, popovers |
| `muted` / `muted-foreground` | `oklch(0.955 0.015 165)` / `oklch(0.52 0.025 165)` | Subtle backgrounds, secondary text |
| `border` / `input` / `ring` | `oklch(0.91 0.018 165)` / same / primary | Borders, inputs, focus rings |

### Text & Status

| Token | Light value | Usage |
| --- | --- | --- |
| `foreground` | `oklch(0.24 0.035 165)` | Default body text |
| `destructive` | `oklch(0.577 0.245 27.325)` | Errors, destructive actions |

### Chart Colors

`chart-1` through `chart-5` cycle through the brand palette (green → lime → gold → muted
green → dark green) for data visualizations.

### Dark Mode

All tokens have dark-mode equivalents in `.dark`. In dark mode, the lime green becomes the
`primary` color (for contrast against the dark background), while green moves to
`secondary`. Gold accents stay similar across both modes.

## Typography

| Role | Font | Tailwind utility | Notes |
| --- | --- | --- | --- |
| Headings (h1–h6) | Cinzel Decorative | `font-heading` | Decorative serif, used for all headings; weights 400/700/900 |
| Body | Montserrat | `font-sans` (default) | Used for paragraphs, UI text, buttons |

Both fonts are self-hosted via `next/font/google` in `app/layout.tsx` and exposed as CSS
variables (`--font-heading`, `--font-sans`). `app/globals.css` applies `font-heading` to all
`h1`–`h6` elements automatically.

## Components

- **Buttons**: rounded/pill shape (`rounded-full`), using `default` (primary), `secondary`
  (lime), `outline`, `ghost`, `link`, and `destructive` variants from
  `components/ui/button.tsx`.
- **Radius**: base `--radius` is `1rem`, with `sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl` scales
  derived from it.

## Reference

See `app/brand-guideline/page.tsx` for a live, rendered version of this palette and
typography, including swatches with their exact token values.
