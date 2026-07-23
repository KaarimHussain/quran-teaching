@AGENTS.md

# Product Context

This project is the **Free Quranic Learning Portal** — a platform providing free
Quranic education (English, Urdu, Arabic) to children, adults, and new Muslims, with
Super Admin, Teacher, Student, and Parent roles. Before implementing features, consult:

- `docs/REQUIREMENTS.md` — original source requirements
- `docs/PRD.md` — product vision, personas, goals, scope
- `docs/FEATURES.md` — detailed feature specs & acceptance criteria
- `docs/DATA_MODEL.md` — entities, fields, relationships
- `docs/USER_FLOWS.md` — key user journeys
- `docs/TECH_SPEC.md` — architecture, stack, API surface, open decisions
- `docs/ROADMAP.md` — phased delivery plan

# Brand & Design System

This project has a defined visual identity — see `docs/BRAND_GUIDELINES.md` for the full color
palette, typography, and component conventions. A live reference is available at the
`/brand-guideline` route (`app/brand-guideline/page.tsx`).

- **Heading font**: Cinzel Decorative (`font-heading`, loaded via `next/font/google` in `app/layout.tsx`)
- **Body font**: Montserrat (`font-sans`, loaded via `next/font/google` in `app/layout.tsx`)
- **Theme tokens**: defined as CSS variables in `app/globals.css` (`:root` for light mode, `.dark` for dark mode) and consumed through Tailwind's `bg-primary`, `text-secondary-foreground`, etc.

When building new UI, use the existing theme tokens (`primary`, `secondary`, `accent`, `muted`,
etc.) instead of hardcoding colors, and use `font-heading` for headings / `font-sans` for body
text so new pages stay consistent with `BRAND_GUIDELINES.md`.
