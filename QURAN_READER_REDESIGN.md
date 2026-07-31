# Prompt: Redesign the Quran Reader (`app/quran/[surahId]/reader.tsx`)

## Context

This is a Next.js 16 app (Turbopack) with Tailwind CSS and the following brand tokens defined in `app/globals.css`:
- **Primary**: deep forest green (`bg-primary`, `text-primary`, `text-primary-foreground`)
- **Secondary**: lime green (`bg-secondary`)
- **Accent**: gold (`bg-accent`, `text-accent`)
- **Surfaces**: `bg-background` (mint off-white), `bg-card`, `bg-muted`
- **Fonts**: `font-heading` (Cinzel Decorative) for headings, `font-sans` (Montserrat) for body
- **Dark mode**: all tokens have `.dark` equivalents via CSS variables

The current reader lives in two files:
- `app/quran/[surahId]/page.tsx` — server component, fetches verses via `fetchSurahVerses(id)` from `lib/quran.ts` (calls `api.quran.com`), passes `surah`, `verses`, `allSurahs` as props to `<QuranReader />`
- `app/quran/[surahId]/reader.tsx` — `"use client"` component with the full UI

The data types are:
```ts
type QuranWord   = { id, position, text, transliteration, translation, audioUrl }
type QuranVerse  = { id, verseNumber, verseKey, words: QuranWord[], translationText, tajweedHtml }
type Surah       = { id, nameArabic, nameSimple, nameTranslated, versesCount }
```

Props passed into `QuranReader`: `{ surah: Surah, verses: QuranVerse[], allSurahs: Surah[] }`

---

## What to build

Rewrite `app/quran/[surahId]/reader.tsx` completely. Keep the same prop signature and all existing functionality (word-by-word mode, tajweed mode, audio playback, surah navigation via `router.push`). Improve everything else as described below.

---

## 1. Back to Dashboard button

Add a back button in the top-left of the header that calls `router.back()` (or links to `/student/dashboard`). Use `ChevronLeft` or `ArrowLeft` from lucide-react. It must be visible on all screen sizes.

---

## 2. Book-like page UI with turn animation

Wrap the verse content in a **paged book layout**:

- Split verses across pages of ~5–7 verses each (configurable constant `VERSES_PER_PAGE = 6`).
- Render only the current page's verses.
- Add **Previous Page / Next Page** navigation buttons at the bottom (arrow buttons, large tap targets for mobile).
- Animate the page transition with a CSS `translateX` slide (or a subtle fade + slight scale), triggered by a `direction` state (`"left" | "right" | "none"`). Use `useRef` + CSS classes for the animation — no external animation library needed. The animation should feel like turning a book page: outgoing page slides/fades out in the turn direction, incoming page slides in from the opposite direction.
- The book container should have a parchment-like feel: `bg-card` with a subtle `box-shadow` and a thin `border border-accent/30` or `border-border`. On `md+` screens, add a faint left-edge book spine effect (a 4px left border with `border-accent/40` and a subtle inset shadow).
- Show current page / total pages indicator (e.g. "Page 3 of 12") centered between the page nav buttons, styled in `text-muted-foreground text-xs`.

---

## 3. Loading state

`page.tsx` is a server component so `fetchSurahVerses` blocks render. Add a `loading.tsx` file at `app/quran/[surahId]/loading.tsx` that shows a skeleton:
- Skeleton header bar (same height as real header, `bg-muted animate-pulse`)
- Skeleton surah title block (3 lines centered, `bg-muted/60 animate-pulse rounded`)
- 4–5 skeleton verse cards (each: a `rounded-lg border border-border bg-card p-5` with pulsing lines for Arabic text and translation)

---

## 4. Error state

Add `app/quran/[surahId]/error.tsx` — a Next.js `"use client"` error boundary:
- Show a centered card with an icon (e.g. `AlertCircle` from lucide-react), heading "Could not load this Surah", a short message ("The Quran API may be temporarily unavailable. Please try again."), a **Try again** button (`reset()` from error boundary props), and a **Go back** button (`router.back()`).
- Style with brand tokens, no hardcoded colors.

---

## 5. Header UX improvements

The sticky header currently has too many things crammed in one row. Restructure it:

**Row 1** (always visible):
- Left: Back button → Logo/title "Quran Reader" in `font-heading text-primary`
- Center: Surah name in Arabic + transliteration (read-only display, not the `<select>`)
- Right: Surah `<select>` dropdown (compact, icon-only trigger on mobile that opens the full select on click), Tajweed toggle button, ThemeToggle

**Mobile** (`< md`): collapse center section, keep back + select + tajweed in a single tight row.

---

## 6. Verse card improvements

Each verse card (`bg-card rounded-lg border border-border p-5 shadow-sm`) should:
- Show the verse number badge top-left (existing, keep it)
- In word-by-word mode: hovering a word shows a small tooltip-like popover below it with `transliteration` and `translation` (use CSS `group-hover` + absolute positioning — no JS needed). Remove the sticky selected-word panel that covers content; replace it with this inline tooltip approach.
- In tajweed mode: the `dangerouslySetInnerHTML` tajweed block remains as-is
- Add a small speaker icon (`Volume2`, 14px) per verse (top-right of card) that plays the full verse audio from `https://everyayah.com/data/Alafasy_128kbps/{padded_surahId}_{padded_verseNumber}.mp3` (e.g. surah 2 verse 5 → `002005.mp3`). Pause any currently playing audio first.

---

## 7. Mobile responsiveness

- Header: single row on mobile, use icon-only buttons where possible
- Book container: full-width on mobile, `max-w-3xl mx-auto` on desktop, `px-4 py-6` padding
- Arabic text size: `text-xl` on mobile, `text-2xl sm:text-3xl` for the Bismillah
- Word buttons: `min-w-[3rem]` so they don't get too narrow on small screens
- Page nav buttons: full-width on mobile (`w-full`), side-by-side on `sm+`
- Bottom page-turn buttons should have `min-h-[44px]` for touch targets

---

## 8. State management cleanup

Current state is scattered. Consolidate into a single `useReducer` with this shape:

```ts
type ReaderState = {
  currentPage: number;
  selectedWordId: number | null;
  tajweedMode: boolean;
  pageDirection: "left" | "right" | "none";
  playingVerseKey: string | null;
}
```

Actions: `SET_PAGE`, `SELECT_WORD`, `TOGGLE_TAJWEED`, `SET_VERSE_AUDIO`.

Keep `audioRef` as a `useRef` outside the reducer (refs don't belong in state).

---

## Do NOT change
- `app/quran/[surahId]/page.tsx` — leave the server component as-is
- `lib/quran.ts` — leave the data layer as-is
- The prop types / component name `QuranReader`
- Existing tajweed CSS class logic (`tj-*` classes)

---

## Constraints
- No new npm packages — use only what's already installed (Tailwind, lucide-react, next/navigation, react)
- All colors via brand tokens, no hardcoded hex
- `font-heading` for Arabic display headings, `font-sans` for body/UI text
- Arabic text must always have `dir="rtl" lang="ar"`
- The `loading.tsx` and `error.tsx` are new files at the same route segment
