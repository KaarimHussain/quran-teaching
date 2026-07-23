# Technical Specification

Proposed architecture and technology choices for the Free Quranic Learning Portal. This
complements `PRD.md`, `FEATURES.md`, `DATA_MODEL.md`, and `USER_FLOWS.md`. Items marked
**[DECISION NEEDED]** should be confirmed with stakeholders before/while building.

## High-Level Architecture

One platform, four roles (Super Admin, Teacher, Student, Parent), sharing a common
backend and data model with role-based access control.

```
┌──────────────────────────────────────────────────────────┐
│                  Web App (Next.js, responsive)             │
│  Role-aware routes/layouts: Admin / Teacher / Student /    │
│  Parent — multi-language (EN / UR / AR, incl. RTL)          │
└───────────────────────────┬────────────────────────────────┘
                              │ Server Actions / API routes
                     ┌────────▼─────────┐
                     │   Database         │
                     │ (Postgres + ORM)   │
                     └────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                      │                       │
┌───────▼───────┐   ┌──────────▼─────────┐   ┌─────────▼─────────┐
│ Video/Live      │   │ File Storage        │   │ Notifications      │
│ Classes (RTC)   │   │ (resources,         │   │ (in-app + email)   │
│                 │   │ recordings,         │   │                    │
│                 │   │ certificates)       │   │                    │
└─────────────────┘   └─────────────────────┘   └────────────────────┘
```

## Recommended Stack

Builds on what's already in this repo (Next.js 16, Tailwind v4, shadcn-based UI, brand
theme in `app/globals.css` — see `BRAND_GUIDELINES.md`).

**Target deployment: Hostinger Shared/Business Hosting "Node.js App" (cPanel + Phusion
Passenger).** This is a single-Node-process environment with no Docker, no root access,
no self-hosted background services, and a MySQL/MariaDB database provisioned via hPanel.
The stack below is adjusted accordingly — see "Hosting Constraints" further down.

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js (App Router) | Already set up; serves all four roles via role-based routes/layouts. Deployed via a custom `server.js` entry point that Passenger runs with `node server.js` |
| UI | Tailwind v4 + shadcn components | Already initialized (`components/ui`, `components.json`); dark mode via existing `.dark` theme tokens |
| Internationalization | `next-intl` (or similar App Router i18n library) | English, Urdu, Arabic; Urdu/Arabic require RTL (`dir="rtl"`) layout support |
| Auth | Auth.js (NextAuth) with credentials/email | Roles (`SUPER_ADMIN`, `TEACHER`, `STUDENT`, `PARENT`) stored on `User`, enforced via middleware/route guards |
| Database | **MySQL / MariaDB** (Hostinger hPanel database) | Provisioned via Hostinger's hPanel "Databases" section. Connection configured via `DATABASE_URL` environment variable |
| ORM | Prisma (`provider = "mysql"`) | Type-safe schema matching `DATA_MODEL.md`; standard `PrismaClient` with no custom adapter (`lib/db.ts`). Migrations managed with `prisma migrate deploy` (`npm run db:migrate`) |
| Live video classes | **Embedded Jitsi-as-a-Service (`meet.jit.si` / 8x8 JaaS)** or a managed provider (LiveKit Cloud free tier, Daily.co, 100ms) | Self-hosting Jitsi/LiveKit requires a VPS, which isn't available here — use the public/managed Jitsi instance embedded via iframe, or a managed video API's free tier. Recording handled by the provider, not the app server **[DECISION NEEDED]** |
| File storage | External S3-compatible storage (Cloudflare R2 free tier, Backblaze B2, Supabase Storage) | Resource library files, class recordings, certificate PDFs, subtitle files — do **not** rely on Hostinger's disk quota for user-uploaded media |
| Real-time updates | Polling (e.g., periodic fetch via React Query/SWR) or a managed realtime service (Pusher/Ably free tier) | Long-lived WebSocket connections are unreliable on shared Node.js hosting — avoid a self-hosted socket.io server |
| Notifications | In-app `Notification` table (polled) + email via Resend or SMTP API | Respect `User.preferredLanguage` for message content; avoid Nodemailer + self-hosted SMTP (not available on shared hosting) |
| Scheduled jobs | Hostinger hPanel **Cron Jobs** hitting authenticated internal API routes (e.g., `/api/cron/class-reminders`) | Used for class reminders, recurring availability rollovers, etc. — no long-running background workers |
| Hosting | Hostinger Shared/Business Hosting — "Setup Node.js App" (Node version pinned via hPanel) | Single Node process per app; free to end users, low fixed hosting cost |

## Routing & Access Control

Proposed App Router structure (illustrative):

```
app/
  [locale]/                  # en | ur | ar — drives language + RTL
    (auth)/
      login/
      register/
    (admin)/                 # SUPER_ADMIN
      dashboard/
      users/
      courses/
      schedule/
      forum-moderation/
    (teacher)/                # TEACHER
      dashboard/
      availability/
      classes/[id]/
      assignments/
      students/[id]/progress
    (student)/                # STUDENT
      dashboard/
      courses/
      classes/[id]/
      assignments/
      resources/
      certificates/
    (parent)/                 # PARENT
      dashboard/
      children/[id]/
    forum/
  brand-guideline/            # existing design reference (already built)
```

- Route groups per role are protected by middleware/layout checks on `User.role`.
- `[locale]` segment drives `next-intl` locale + `dir="rtl"|"ltr"` on `<html>` for
  Urdu/Arabic vs. English.
- All data-mutating operations (attendance, progress entries, grading, certificate
  issuance, moderation) go through server actions / API routes that re-check role and
  ownership server-side.

## Hosting Constraints (Hostinger Shared Node.js)

The app runs as a single long-lived Node.js process under Phusion Passenger, managed via
hPanel's "Setup Node.js App". This shapes several decisions above:

- **Entry point**: Next.js must be built (`next build`) and started via a small
  `server.js` (custom server) that Passenger invokes — not the Vercel serverless model.
  No edge runtime / serverless functions.
- **Database**: MySQL/MariaDB provisioned through Hostinger hPanel "Databases". Set
  `DATABASE_URL=mysql://user:password@host:3306/dbname` in the hPanel environment
  variable UI. Run `npm run db:migrate` (which calls `prisma migrate deploy`) after
  each deploy to apply any pending schema migrations.
- **No Docker / no root**: anything requiring a separate service (Jitsi, LiveKit,
  Redis, socket.io server) must be an external managed dependency, not self-hosted.
- **Disk usage**: app code + `node_modules` only. User-generated media (recordings,
  resources, certificates) must live in external object storage (Cloudflare R2 /
  Backblaze B2), referenced by URL in the DB.
- **Process restarts**: Passenger may restart the app on inactivity or after deploys —
  don't rely on in-memory state (sessions, queues) surviving between requests; persist
  to the database.
- **Cron**: hPanel provides standard cron job scheduling (calls a URL or runs a script
  on a schedule) — use this for reminder notifications and any periodic cleanup instead
  of an in-process scheduler.
- **Env vars / secrets**: configured via hPanel's Node.js app environment variable UI.

## API Surface (illustrative)

| Endpoint / Action | Roles | Description |
| --- | --- | --- |
| `POST /api/auth/register` `/login` | Public | Auth |
| `GET /api/courses` | All | Course catalog |
| `POST /api/enrollments` | Student | Enroll in a course |
| `GET/POST /api/teachers/:id/availability` | Teacher (own), Admin | Manage availability |
| `POST /api/classes` | Admin, Teacher, Student (booking) | Create/book a `ClassSession` |
| `GET /api/classes/:id` | Participants, Admin | Class details + `joinUrl` |
| `POST /api/classes/:id/attendance` | Teacher, system | Record attendance |
| `POST /api/assignments` | Teacher | Create assignment |
| `POST /api/assignments/:id/submissions` | Student | Submit homework |
| `PATCH /api/submissions/:id` | Teacher | Grade/feedback |
| `POST /api/progress` | Teacher, Admin | Record `ProgressEntry` |
| `GET /api/students/:id/progress` | Student (own), linked Parent, Teacher, Admin | View progress |
| `GET /api/parents/:id/children` | Parent (own) | Linked students |
| `GET /api/resources` | All | Resource library, filterable by course/language |
| `POST /api/certificates` | Admin/Teacher (issue), system | Issue certificate |
| `GET/POST /api/forum/posts` | All (read), All (post) | Forum |
| `PATCH /api/teachers/:id/verification` | Admin | Verify/reject teacher, manage badges |

## Live Class & Accessibility Considerations

- **One-to-one vs. group**: `ClassSession.type` determines room configuration
  (participant limits, layout).
- **Audio-only mode**: client toggles video off and requests a lower-bitrate/audio-only
  stream from the RTC provider — important for low-bandwidth users.
- **Low bandwidth mode**: app-wide setting that reduces media quality (video resolution,
  autoplay, image sizes) — should be a persisted user preference.
- **Recordings**: produced by the embedded/managed video provider (not the Hostinger
  app server), then uploaded to external object storage and linked via `Recording.url`;
  access-controlled to session participants + Admin.
- **Subtitles**: subtitle files (e.g., `.vtt`) stored alongside video resources/
  recordings, keyed by language, surfaced via the video player's track selection.

## Non-Functional Considerations

- **Mobile-first UI** for all four roles, using the existing shadcn component set and
  brand theme (including dark mode).
- **RTL support**: Urdu and Arabic require mirrored layouts — use CSS logical properties
  and `dir` attribute rather than hardcoded `left`/`right`.
- **Notifications**: in-app required for v1; email optional/configurable
  **[DECISION NEEDED]**.
- **Security**: role-based access enforced server-side; passwords hashed; parent access
  scoped strictly to linked students; recordings/resources access-controlled.
- **Cost**: since the platform is free for end users, prefer free-tier managed
  components (Cloudflare R2, Jitsi-as-a-Service, Resend free tier) to minimize ongoing
  costs beyond the Hostinger hosting plan itself.

## Open Decisions Summary

1. Video conferencing provider — embedded `meet.jit.si` (free, simplest) vs. LiveKit
   Cloud / Daily.co / 100ms free tier (better control over recording & layout) — affects
   recording pipeline and cost. **[DECISION NEEDED]**
2. Object storage provider for resources/recordings/certificates (Cloudflare R2 vs.
   Backblaze B2 vs. Supabase Storage). **[DECISION NEEDED]**
3. Email notifications in scope for v1 or later phase, and via which provider (Resend
   vs. Hostinger SMTP)?
4. Exact certificate issuance criteria (drives automation vs. manual issuance).
5. One-to-one class booking: student-initiated vs. admin/teacher-assigned (see
   `DATA_MODEL.md` open questions).
6. Confirm exact Hostinger Node.js runtime version and server OS (for Prisma
   `binaryTargets`) before deploying — run `prisma generate` as part of the
   build step so the correct native query engine binary is bundled.
