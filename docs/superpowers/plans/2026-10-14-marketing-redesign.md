# Marketing Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the landing, courses and course-outline pages (plus shared header/footer) to be clearer, curriculum-led, easier for older people to read, and conversion-focused.

**Architecture:** Track presentation metadata lives in one new module (`lib/curriculum/tracks.ts`) derived from the existing curriculum data. The landing page renders purely from static curriculum data (no DB). Courses and outline pages query courses with their curriculum levels and reuse the same track metadata. All new copy lives under `marketing.*` in the message files.

**Tech Stack:** Next.js 16 App Router (read `node_modules/next/dist/docs/` before Next APIs), Prisma 7, next-intl, Tailwind v4 + shadcn/ui (`Accordion` exists in `components/ui/accordion.tsx`), lucide-react, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-14-marketing-redesign-design.md`

## Global Constraints

- Body text 18px (`text-lg leading-relaxed`); secondary ≥ 16px (`text-base`); no `text-xs`/`text-sm` for content (badges may use `text-sm`).
- Paragraphs capped at ~65ch (`max-w-prose`).
- `font-heading` (Cinzel Decorative) only for page H1 and section H2s at ≥ 30px; card titles/H3 use `font-sans font-semibold` ≥ 20px.
- Important text `text-foreground`; `text-muted-foreground` only for secondary text; all pairs WCAG AA in light and dark.
- Buttons min `h-12`, always text-labelled. Primary CTA copy exactly "Start learning — it's free" → `/register`.
- First use of a term is explained in plain words.
- Theme tokens only, no hardcoded colours (CLAUDE.md).
- All new copy under `marketing.*` in `messages/en.json`, copied verbatim into `ur.json`/`ar.json`, inserted textually (files contain duplicate keys). New client components using `useTranslations` must have their namespace added to the whitelist in `app/layout.tsx`.
- Landing page makes no database calls.
- Track order everywhere = `TRACK_COURSES` order.

## Review Focus

1. Track course renamed/deactivated/missing in the DB → `/courses` must still render the tracks that exist and skip the missing one, not crash. Test: Task 1 `trackFor returns undefined for unknown names`; Task 4 step verifies with a course deactivated.
2. Course with no levels and no modules (e.g. a new admin course) → outline shows the "content being prepared" message, not an empty page. Verified in Task 5 browser step.
3. RTL locale (Urdu/Arabic) → layouts must not break (icons/arrows mirrored via logical `ms-/me-/ps-/pe-` classes, no `ml-/mr-`). Verified in Task 6.
4. 375px phone width → no horizontal scroll on any page, header actions reachable via mobile menu. Verified in Task 6.
5. Dark mode → every new text/background pair still AA. Verified in Task 6 contrast step.

---

### Task 1: Track metadata module

**Files:**
- Create: `lib/curriculum/tracks.ts`
- Test: `lib/curriculum/tracks.test.ts`

**Interfaces:**
- Consumes: `CURRICULUM`, `TRACK_COURSES`, `TrackCourse` from `lib/curriculum/data.ts`.
- Produces:
  - `export type TrackInfo = { name: TrackCourse; slug: string; icon: LucideIcon; messageKey: string }` — `messageKey` is the key under `marketing.tracks.<messageKey>` holding `description` and `audience` copy (copy is i18n, not hardcoded).
  - `export const TRACKS: TrackInfo[]` in `TRACK_COURSES` order.
  - `export function trackFor(courseName: string): TrackInfo | undefined`
  - `export function levelRange(track: TrackCourse): { first: number; last: number; levels: number; modules: number }`
  - `export const CURRICULUM_TOTALS: { tracks: number; levels: number; modules: number }`

Slugs/keys/icons (lucide): Quran Reading `quran-reading`/`quranReading`/`BookOpenText`; Tajweed `tajweed`/`tajweed`/`Mic`; Hifz-ul-Quran `hifz`/`hifz`/`Brain`; Quran Understanding `understanding`/`understanding`/`Languages`; Islamic Studies `islamic-studies`/`islamicStudies`/`Landmark`; Advanced Quranic Studies `advanced`/`advanced`/`ScrollText`; Quran Teacher Preparation `teacher-preparation`/`teacherPreparation`/`GraduationCap`.

- [ ] **Step 1: Write failing tests** in `tracks.test.ts`:
  - `TRACKS names equal TRACK_COURSES in order` → `expect(TRACKS.map(t=>t.name)).toEqual([...TRACK_COURSES])`
  - `slugs are unique` → `new Set(slugs).size === 7`
  - `trackFor returns undefined for unknown names` → `trackFor("Qaida for Babies")` is `undefined`; `trackFor("Tajweed")?.slug === "tajweed"`
  - `levelRange Quran Reading` → `{ first: 1, last: 3, levels: 3, modules: 12 }`
  - `levelRange Islamic Studies` → `{ first: 11, last: 18, levels: 8, modules: 32 }`
  - `CURRICULUM_TOTALS` → `{ tracks: 7, levels: 22, modules: 87 }`
- [ ] **Step 2:** `npx vitest run lib/curriculum/tracks.test.ts` → FAIL (module not found).
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Re-run → 6 pass; `npx vitest run` → all pass.
- [ ] **Step 5:** Commit `feat(marketing): track metadata module`.

### Task 2: Marketing copy + header & footer

**Files:**
- Modify: `messages/en.json`, `messages/ur.json`, `messages/ar.json` (add `marketing` top-level namespace)
- Modify: `components/site-header.tsx`, `components/site-footer.tsx`, `components/language-switcher.tsx`
- Create: `components/footer-language-links.tsx` (client)
- Modify: `app/layout.tsx` (whitelist `marketing.footer` for the client component)

**Interfaces:**
- Produces: message namespace `marketing` with sub-objects `header`, `footer`, `cta`, `landing`, `courses`, `outline`, `tracks.<messageKey>.{description,audience}` — later tasks add their keys to the same namespace (insert text, never re-serialise).
- `FooterLanguageLinks({ current }: { current: "EN" | "UR" | "AR" })` — renders three text buttons (English / اردو / العربية) calling `setLanguage` from `app/actions/preferences.ts` then `window.location.reload()`, same as `LanguageSwitcher`.

- [ ] **Step 1:** Add `marketing.header` (nav labels: home, courses, howItWorks, quranReader, store; login "Log in"; startFree "Start free"; openMenu), `marketing.cta.primary` = "Start learning — it's free", `marketing.footer` (tagline, column titles, links, languagesTitle, copyright with `{year}`), `marketing.tracks.*` descriptions/audiences for all 7 tracks (plain language, one or two sentences; audience one line), copied to ur/ar.
- [ ] **Step 2:** Header: nav = Home `/`, Courses `/courses`, How it works `/#how-it-works`, Quran Reader `/quran`, Store `/store` at `text-base font-medium`; desktop actions Log in (outline) + Start free (primary), `h-12 px-6`; mobile sheet rows `min-h-12 text-lg`, full-width `h-12` buttons. Copy via `getTranslations("marketing.header")`.
- [ ] **Step 3:** `LanguageSwitcher`: trigger label `text-sm` (was `text-xs`) and `aria-label="Change language"`. (Also used in dashboards — acceptable improvement.)
- [ ] **Step 4:** Footer: replace `href="#"` language links with `FooterLanguageLinks`; links: Courses, How it works, Quran Reader, Log in, Start free, Become a volunteer teacher (`/register`); all text including the copyright line `text-base`.
- [ ] **Step 5:** Verify: `npx tsc --noEmit`, `npx eslint components/site-header.tsx components/site-footer.tsx components/footer-language-links.tsx components/language-switcher.tsx app/layout.tsx`, all three message files parse (`node -e "require('./messages/xx.json')"`). Browser: footer language button switches language on `/` (page reloads with `dir="rtl"` for اردو), switch back to English.
- [ ] **Step 6:** Commit `feat(marketing): readable header and working footer language links`.

### Task 3: Landing page

**Files:**
- Modify (rewrite): `app/page.tsx`
- Create: `components/marketing/section-heading.tsx` (server; `{ eyebrow?: string; title: string; intro?: string; align?: "center" | "start" }` — H2 `font-heading text-3xl sm:text-4xl`, intro `text-lg text-muted-foreground max-w-prose`)
- Create: `components/marketing/faq.tsx` (server component wrapping shadcn `Accordion` with `{ items: { question: string; answer: string }[] }`; trigger text `text-lg font-semibold`, content `text-lg`)
- Modify: message files (`marketing.landing.*`)

**Interfaces:**
- Consumes: `TRACKS`, `levelRange`, `CURRICULUM_TOTALS` (Task 1); `STAGES` (`lib/curriculum/data.ts`); `marketing.cta.primary`, `marketing.tracks.*` (Task 2).

- [ ] **Step 1:** Add `marketing.landing` copy: hero (title "Learn the Quran for free, step by step, with a real teacher", subtitle, secondary CTA "See the courses", trust items: "Free forever", "English, Urdu & Arabic", "Verified teachers"), howItWorks (title + 3 steps title/body), path (title, intro, stage descriptions for Foundation/Practice/Understanding/Mastery, stat labels), tracks (title, intro, "Levels {first}–{last}", "{count} levels"), learners (4 cards: children, adults, newMuslims, olderLearners — title + body), parentsTeachers (2 cards), faq (5 Q&As exactly per spec §3.7; age answer says Level 19 is for ages 16+), final CTA (title, body, "I already have an account").
- [ ] **Step 2:** Rewrite `app/page.tsx` as the 8 sections in spec §3 order; `id="how-it-works"` on section 2; track cards link `/courses#<slug>`; no `prisma` import (assert with `grep -c prisma app/page.tsx` → 0). Keep `SiteHeader`/`SiteFooter`. Keep existing decorative gradient style for hero but text on solid enough background for AA.
- [ ] **Step 3:** Verify: tsc, eslint on changed files, `npx vitest run`, `npm run build` passes; browser at 1280px and 375px: all 8 sections render, FAQ opens with Enter key, track card link scrolls on `/courses` (after Task 4; for now link resolves).
- [ ] **Step 4:** Commit `feat(marketing): curriculum-led, readable landing page`.

### Task 4: Courses page

**Files:**
- Modify (rewrite): `app/courses/page.tsx`
- Modify: message files (`marketing.courses.*`)

**Interfaces:**
- Consumes: `TRACKS`, `trackFor` (Task 1); `SectionHeading` (Task 3); `marketing.tracks.*`, `marketing.cta.primary`.

- [ ] **Step 1:** Add copy: hero (title "Choose your learning path", intro), guide (title "Where should I start?", 3 cards with exact prompts from spec §4.2 and target track names), track section labels ("Who it's for", "What's inside", "Level {number}", "{count} modules", "See what you'll learn"), other courses title, notSure box (reuse existing wording).
- [ ] **Step 2:** One query: `prisma.course.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, include: { levels: { orderBy: { number: "asc" }, select: { number: true, title: true, subtitle: true, _count: { select: { modules: true } } } } } })`. Partition: curriculum tracks = courses where `trackFor(name)` defined, ordered by `TRACKS` index; other = rest **with no levels**.
- [ ] **Step 3:** Render hero → guide (cards link `#<slug>`, only for tracks present) → track sections (`id={slug}`, `scroll-mt-24`) → other courses (hidden if empty) → not-sure box. Remove Beginner/Intermediate/Advanced badges and the old `courseIcons` map.
- [ ] **Step 4:** Verify: tsc, eslint, build; browser: 7 tracks in order + "Qaida for Babies" under Other courses; guide links scroll to sections; deactivate "Tajweed" in local DB (`UPDATE courses SET isActive=0 WHERE name='Tajweed'`) → page renders 6 tracks and the Tajweed guide card is hidden; reactivate.
- [ ] **Step 5:** Commit `feat(marketing): curriculum-led courses page`.

### Task 5: Course outline page

**Files:**
- Modify (rewrite): `app/courses/[courseId]/outline/page.tsx`
- Modify: message files (`marketing.outline.*`)

**Interfaces:**
- Consumes: `trackFor` (Task 1); `asStringList` (`lib/curriculum/lines.ts`); `marketing.tracks.*`, `marketing.cta.primary`.

- [ ] **Step 1:** Add copy: back link, facts ("{levels} levels", "{modules} modules", "Free"), howYouProgress (title + 3 short sentences per spec §5.3), level label "Level {number}", ageBadge "{age}+", whatYouLearn "What You Learn", ableTo "By the end you'll be able to…", preparing message, lessons label, CTA title.
- [ ] **Step 2:** Query course (`isActive: true`) with `levels` (ordered) → `modules` (ordered by `moduleOrder`; select id, code, title, subjects, mandatoryLearning) and legacy `modules` where `levelId: null` with `contents` (ordered). Keep existing `generateStaticParams` (try/catch) unchanged.
- [ ] **Step 3:** Render per spec §5: header (description from `marketing.tracks.<key>.description` when `trackFor` matches, else `course.description`), progress box only when the course has levels, level sections with purpose / methodology callout / age badge, module cards, legacy list, "preparing" message when no levels and no modules, CTA.
- [ ] **Step 4:** Verify: tsc, eslint, build; browser: Islamic Studies outline shows Levels 11–18 with Level 12 methodology note; Advanced shows Level 19 "16+"; Quran Teacher Preparation shows Level 22 disclaimer; Qaida for Babies shows legacy/preparing view.
- [ ] **Step 5:** Commit `feat(marketing): curriculum-led course outline`.

### Task 6: Accessibility & responsive verification

**Files:** fixes in whichever files fail; no new files expected.

- [ ] **Step 1: Text-size audit:** `grep -nE "text-xs|text-sm" app/page.tsx app/courses/page.tsx "app/courses/[courseId]/outline/page.tsx" components/site-header.tsx components/site-footer.tsx components/marketing/*.tsx` → every hit is a badge or none; fix others.
- [ ] **Step 2: Physical-direction audit:** `grep -nE "\b(ml|mr|pl|pr|left|right)-" ` on the same files → replace with logical `ms/me/ps/pe/start/end`.
- [ ] **Step 3: Contrast:** in the browser, compute contrast ratios (via `getComputedStyle` color/background of representative elements: body text, muted text, primary button, badges, CTA section text) on `/` in light and dark (`document.documentElement.classList.toggle('dark')`); every ratio ≥ 4.5 (or ≥ 3 for text ≥ 24px / ≥ 18.66px bold). Fix tokens usage (not token values) where failing.
- [ ] **Step 4: Responsive:** at 375×812 and 1280×800, on all three pages: `document.documentElement.scrollWidth <= window.innerWidth`; header menu opens and contains Log in / Start free; buttons ≥ 48px tall (`getBoundingClientRect().height >= 48` for `a,button` with primary CTA text).
- [ ] **Step 5: RTL:** switch to اردو via footer, load `/`, `/courses`, an outline → no overflow, arrows/icons on correct side; switch back.
- [ ] **Step 6:** Full checks: `npx vitest run`, `npx tsc --noEmit`, `npx eslint` on all changed files, `npm run build`. Commit fixes `fix(marketing): accessibility and responsive pass`.
