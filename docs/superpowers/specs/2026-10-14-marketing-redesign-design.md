# Marketing Pages Redesign — Design Spec

**Date:** 2026-10-14
**Scope:** Landing (`/`), Courses (`/courses`), Course Outline (`/courses/[courseId]/outline`), shared `SiteHeader` / `SiteFooter`.
**Out of scope (later rounds):** store, blog, events, Quran reader, dashboards.

## Goals

1. **Look and feel good** — polished, calm, trustworthy; refine the existing brand (palette, Cinzel Decorative, Montserrat), don't replace it.
2. **Understandable** — a visitor grasps within seconds what is offered, that it is free, and what to do next.
3. **Easy for older people** — comfortable to read and operate.
4. **Market it** — every page drives toward one action: start free.

Audience: parents choosing for children, adult learners, new Muslims, older learners.

## 1. Readability rules (apply to all in-scope pages)

| Rule | Value |
| --- | --- |
| Body text | 18px (`text-lg`), `leading-relaxed` |
| Secondary text | ≥ 16px (`text-base`). No `text-xs`/`text-sm` for content on these pages (badges may use `text-sm`). |
| Line length | Paragraphs capped at ~65ch (`max-w-prose` or equivalent) |
| Display headings | Cinzel Decorative (`font-heading`) only for the page H1 and section H2s, at ≥ 30px |
| Small headings | Card titles / H3 use Montserrat semibold (`font-sans font-semibold`), ≥ 20px |
| Contrast | Important text uses `text-foreground`; `text-muted-foreground` only for secondary text; every text/background pair used must meet WCAG AA (4.5:1 normal, 3:1 large) in light and dark mode |
| Buttons | Min height 48px (`h-12`), text labels (icons optional, never icon-only for primary actions) |
| Primary CTA copy | "Start learning — it's free" → `/register` |
| Jargon | First use of a term is explained in plain words, e.g. "Tajweed — reciting with correct pronunciation" |
| Focus | Existing visible focus ring kept on all interactive elements |

The `h1–h6 { font-heading }` base rule in `globals.css` stays; components opt out with explicit `font-sans` where the rule above says Montserrat.

## 2. Header and footer

**SiteHeader**
- Nav links at 16px: Home `/`, Courses `/courses`, How it works `/#how-it-works`, Quran Reader `/quran`, Store `/store`.
- Always-visible actions: **Log in** (outline) and **Start free** (primary), both `h-12` on desktop.
- Language switcher keeps its current behaviour but has a visible text label (current language name), not only an icon.
- Mobile sheet: links as large rows (≥ 48px tall, 18px text), Log in / Start free full-width buttons.

**SiteFooter**
- Language column uses the existing language-switching mechanism (`setLanguage` action / `LanguageSwitcher`) instead of `href="#"` links.
- Link set: Courses, How it works, Quran Reader, Log in, Start free, Become a volunteer teacher (`/register`).
- Text ≥ 16px.

## 3. Landing page (`/`)

Content comes from static curriculum data (`lib/curriculum/data.ts` + new `lib/curriculum/tracks.ts`) — **no database access**, so the page is fast and survives a DB outage.

Sections, in order:
1. **Hero** — H1 "Learn the Quran for free, step by step, with a real teacher". Supporting line about children, adults and new Muslims. Buttons: "Start learning — it's free" (`/register`), "See the courses" (`/courses`). Trust row: Free forever · English, Urdu & Arabic · Verified teachers.
2. **How it works** (`id="how-it-works"`) — 3 numbered steps: (1) Create a free account, (2) Choose your track, (3) Learn with a teacher who signs off each step before you move on.
3. **The learning path** — stages Foundation → Practice → Understanding → Mastery (from `STAGES`), with counts derived from data: 22 levels, total modules (computed, currently 87), 7 tracks.
4. **The 7 tracks** — one card per track in `TRACK_COURSES` order: icon, name, one-line "who it's for", number of levels, level range (e.g. "Levels 1–3"). Card links to `/courses#<track-slug>`.
5. **For every learner** — four cards: Children (with parents), Adults, New Muslims, Older learners; each lists what makes it easy (large text, audio lessons, low-bandwidth mode, Urdu & Arabic).
6. **For parents and teachers** — two cards: parents (dashboard: attendance, progress, homework) and volunteer teachers (link `/register`).
7. **Questions & answers** — accordion (shadcn `Accordion`, keyboard accessible) with: Is it really free? · Do I need to know Arabic? · Which languages can I learn in? · What does "teacher sign-off" mean? · Is there an age limit? (answer mentions Level 19 is 16+).
8. **Final CTA** — repeat primary CTA + "I already have an account" (`/login`).

## 4. Courses page (`/courses`)

Data: one query for active courses with their curriculum levels (`levels` ordered by `number`, with `_count` of modules). Track presentation metadata from `tracks.ts`.

1. **Hero** — H1 "Choose your learning path", plain intro, primary CTA.
2. **Where should I start?** — 3 guide cards linking to track anchors:
   - "I can't read Arabic yet" → Quran Reading
   - "I can read, and want correct pronunciation" → Tajweed
   - "I want to memorise the Quran" → Hifz-ul-Quran
3. **The 7 tracks** — in `TRACK_COURSES` order (only those present and active in the DB). Each section has `id=<track-slug>`, icon, name, plain description, "who it's for", list of levels (number, title, subtitle if any), module count, buttons **See what you'll learn** (`/courses/<id>/outline`) and **Start learning — it's free** (`/register`).
4. **Other courses** — active courses that have no curriculum levels (e.g. "Qaida for Babies"), as simple cards with outline + start buttons. Section hidden if empty.
5. **Not sure?** — closing help box (existing copy, restyled).

The Beginner / Intermediate / Advanced badges are removed.

## 5. Course outline (`/courses/[courseId]/outline`)

Data: course with `levels` (ordered by `number`) → `modules` (ordered by `moduleOrder`, selecting code, title, subjects, mandatoryLearning) plus legacy modules (`levelId = null`) with their contents.

1. Back link to `/courses` (≥ 48px target).
2. **Header** — track name (H1), plain description from `tracks.ts` (fallback: `course.description`), quick facts: N levels · N modules · Free.
3. **How you'll progress** — short box: work through each module; your teacher checks what you've learned and signs it off; the next module then opens.
4. **Levels** — each level a section: "Level N — Title", subtitle, purpose, methodology note callout (Fiqh, Duas), "16+" badge when `minAge`. Level 22's purpose (Ijazah disclaimer) is shown as written.
5. **Module cards** — code + title, **What You Learn** list, **By the end you'll be able to…** list (from `mandatoryLearning`; hidden when empty).
6. **Legacy modules** — courses without levels keep a simple module → lesson list (restyled to the readability rules).
7. **CTA** — "Start learning — it's free".

## 6. Shared code

`lib/curriculum/tracks.ts` (new):

```ts
export type TrackInfo = {
  name: TrackCourse;          // one of TRACK_COURSES
  slug: string;               // e.g. "quran-reading"
  description: string;        // plain-language, one or two sentences
  audience: string;           // "who it's for", one line
  icon: LucideIcon;
};
export const TRACKS: TrackInfo[];                 // in TRACK_COURSES order
export function trackFor(courseName: string): TrackInfo | undefined;
export function levelRange(track: TrackCourse): { first: number; last: number; levels: number; modules: number };
```

`levelRange` derives from `CURRICULUM`, so landing and courses pages show the same numbers.

## 7. Copy and i18n

All new user-facing copy lives in `messages/en.json` under `marketing.*` (landing, courses, outline, header, footer, tracks), copied verbatim into `ur.json` and `ar.json` (translation is a later task). Server components use `getTranslations`; any new client component needing copy must have its namespace added to the client-message whitelist in `app/layout.tsx`. Message files are edited by text insertion (they contain duplicate keys a JSON round-trip would drop).

## 8. Testing & acceptance

- **Unit (Vitest):** `TRACKS` has one entry per `TRACK_COURSES` name, in order, with unique slugs; `trackFor` returns undefined for unknown names; `levelRange("Quran Reading")` → `{ first: 1, last: 3, levels: 3, modules: 12 }`; `levelRange("Islamic Studies")` → `{ first: 11, last: 18, levels: 8, modules: 32 }`.
- **Browser check** (local DB, dev server) of all three pages at 375px and 1280px, light and dark: no horizontal scroll; no content text under 16px; primary buttons ≥ 48px tall; all links resolve; FAQ opens with keyboard; language switch in footer works.
- **Contrast:** compute ratios for each text/background token pair used; all ≥ AA.
- `npx tsc --noEmit`, `npx eslint` on changed files, `npx vitest run`, `npm run build` all pass.
- Landing page renders with the database unreachable (no DB calls).
