# Remaining Work — Free Quranic Learning Portal

**Status as of 2026-07-24**

All four role dashboards are complete with real DB data, full i18n (EN/UR/AR), loading
skeletons, and clean TypeScript. What remains below is split into three tiers:
**Must-have for launch**, **Nice-to-have before launch**, and **Post-launch / future**.

---

## Tier 1 — Must-Have Before Launch

### 1. Live Video Integration

The `ClassSession.joinUrl` field exists in the schema but nothing populates it.
Teachers cannot go live and students cannot join a session.

**What needs to happen:**
- Decide on video provider (see Open Decisions below)
- Teacher "Go Live" button in `/teacher/classes` → generates a Jitsi/daily.co room URL,
  writes it to `ClassSession.joinUrl`, sets `status = "LIVE"`
- Student join button in `/student/schedule` is already conditional on
  `status === "LIVE"` or within 15 min of start — just needs a real `joinUrl`
- Admin "End Session" action sets `status = "COMPLETED"`, clears `joinUrl`

**Simplest path:** Embed Jitsi (`meet.jit.si`) — room name = `classSession.id`,
no backend needed, no API key. Teacher creates the room by navigating to it;
students follow the same URL. Store URL in DB on first "Go Live" click.

**Effort:** ~4–6 hours

---

### 2. File/Object Storage for Resources

Resources currently save a **URL string** typed in by the teacher. There is no actual
file upload — teachers must host files elsewhere and paste a link.

**What needs to happen:**
- Integrate an S3-compatible provider (Cloudflare R2 free tier recommended — 10 GB free)
- Add a presigned-URL upload flow: client requests a PUT URL from a server action,
  uploads directly to R2, stores the resulting public URL in `Resource.url`
- Update `app/teacher/resources/upload-resource-form.tsx` to accept a `<input type="file">`
  alongside the existing URL field (or replace it)
- Same pattern for certificate PDFs once PDF generation is wired up

**Effort:** ~6–8 hours (includes R2 account setup, CORS config, upload form)

---

### 3. Email — SMTP Credentials

`lib/mailer.ts` is implemented (nodemailer, HTML templates) and password reset already
calls `sendPasswordResetEmail()`. However, the SMTP transport silently no-ops when
`SMTP_HOST / SMTP_USER / SMTP_PASS` env vars are absent.

**What needs to happen:**
- Choose an SMTP provider: **Resend** (free 3,000 emails/month, easiest setup) or
  Brevo / Mailgun / Hostinger's own SMTP relay
- Add env vars to `.env` and to Hostinger hPanel environment settings:
  ```
  SMTP_HOST=smtp.resend.com
  SMTP_PORT=465
  SMTP_SECURE=true
  SMTP_USER=resend
  SMTP_PASS=re_xxxxxxxxxxxx
  SMTP_FROM=Quran Learning <noreply@yourdomain.com>
  ```
- Test the password reset flow end-to-end (dev mode already prints the link to console)
- Add a second email template: **class reminder** (sent by cron, see item 5)

**Effort:** ~2 hours (config + provider signup + smoke test)

---

### 4. Certificate PDF Generation

The `/admin/certificates` page issues certificates stored in the `Certificate` table.
The student certificates page shows them with a "Download PDF" button, but the button
currently links nowhere — no PDF is generated.

**What needs to happen:**
- Add a `/api/certificate/[id]/pdf` route (or a server action) that uses a headless PDF
  library (`@react-pdf/renderer` or `puppeteer-core` with a minimal Chromium) to
  render a styled certificate and stream it as `application/pdf`
- The certificate should include: student name, course name, pathway level, issue date,
  an Arabic Basmallah header, and the platform logo/seal
- Store the generated PDF URL in `Certificate.pdfUrl` (field already in schema) via
  object storage (item 2 above), or generate on-demand and skip storage

**Effort:** ~5–7 hours (`@react-pdf/renderer` approach is simpler for shared hosting)

---

### 5. Cron Jobs — Class Reminders & Automation

There are no scheduled tasks. Teachers and students get no class reminders, and
`ClassSession.status` is never auto-transitioned.

**What needs to happen:**
- Create `/api/cron/class-reminders` — runs 30 min before each SCHEDULED session,
  sends in-app `Notification` rows (type `CLASS_REMINDER`) to participants + teacher,
  and optionally emails them (requires item 3)
- Create `/api/cron/complete-sessions` — marks sessions COMPLETED if
  `scheduledEnd < now && status == "LIVE"` (cleanup for sessions that weren't manually ended)
- Protect both routes with a secret header: `Authorization: Bearer $CRON_SECRET`
- Register in Hostinger hPanel Cron Jobs (every 15 min hits both routes via `curl`)

**Effort:** ~3–4 hours

---

### 6. Public Courses Page — Real DB Data

`app/courses/page.tsx` uses a hardcoded static array of 6 courses. It should query
`prisma.course.findMany({ where: { isActive: true } })` so admins can manage the
catalog from `/admin/courses` and the public page reflects it.

**Effort:** ~1 hour

---

### 7. Production `.env` Checklist

Before deploying to Hostinger, verify all env vars are set in hPanel:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db_name` |
| `SESSION_SECRET` | 32+ random bytes (used by `jose` for JWT signing) |
| `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.com` |
| `ADMIN_EMAIL` | Initial super admin email |
| `ADMIN_PASSWORD` | Initial super admin password (run `npm run db:seed` once) |
| `SMTP_HOST` | SMTP provider host |
| `SMTP_PORT` | Usually 465 |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / API key |
| `SMTP_FROM` | From address shown in emails |
| `CRON_SECRET` | Random secret for authenticating cron routes |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID (if using R2 for file storage) |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET` | Bucket name |
| `R2_PUBLIC_URL` | Public URL prefix for the bucket |

---

## Tier 2 — Nice-to-Have Before Launch

### 8. Optimistic UI for Instant Toggle Actions

Currently every "mark as read", "approve", "lock post", "cancel session" action
causes a full server round-trip + page reload before the UI updates. These feel slow.

**Pages to update with `useOptimistic`:**
- `app/parent/messages/page.tsx` — mark notification read / mark all read
- `app/admin/courses/page.tsx` — toggle course active/inactive
- `app/admin/forum/page.tsx` — lock/unlock/remove posts
- `app/admin/users/page.tsx` — suspend/activate users

Pattern:
```tsx
const [optimisticItems, applyOptimistic] = useOptimistic(items, (state, id) =>
  state.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item)
);
```

**Effort:** ~3 hours total across all four pages

---

### 9. Suspense Splitting for Heavy Admin Pages

Three pages run 6–10 parallel DB queries before sending any HTML. Even with
`loading.tsx` showing a skeleton instantly, the page "pops in" late because the
entire async component resolves at once.

**Pages to split:**
- `app/admin/page.tsx` — split stats aggregates into a `<StatsSection>` child component
  wrapped in `<Suspense>`, so the shell renders immediately
- `app/admin/reports/page.tsx` — charts data is the slowest; wrap each chart in its own
  `<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>`
- `app/teacher/page.tsx` — same pattern for the stat cards vs. the session list

**Effort:** ~3 hours

---

### 10. i18n for Public Pages

The landing page (`app/page.tsx`), public courses page (`app/courses/page.tsx`), and
error pages have all strings hardcoded in English. Switching language in the nav has
no effect on these pages.

**What needs to happen:**
- Add `publicPage.*` keys to `messages/en.json`, `messages/ur.json`, `messages/ar.json`
- Call `getTranslations("publicPage")` in each public page component
- The language cookie is already read in `i18n/request.ts`, so the server will pick the
  right locale — no extra wiring needed

**Effort:** ~4 hours (writing all three locale files is the bulk of the work)

---

### 11. Student Forum — Reply Action

`app/student/forum/page.tsx` shows posts and reply counts but there is no UI for a
student to post a reply. The teacher forum has `reply-form.tsx` — the same pattern
should be reused for students.

**What needs to happen:**
- Add `app/student/forum/reply-form.tsx` (mirror of `app/teacher/forum/reply-form.tsx`)
- Add a server action `app/student/forum/actions.ts` for `createPost` and `createReply`
- Add a "New Discussion" button on the student forum page (there's already a
  `t("forumPage.newDiscussion")` key in all three locale files)

**Effort:** ~3 hours

---

### 12. Profile / Account Settings Page

There is no page where a user can change their own name, email, password, or
preferred language (other than the language switcher in the nav).

**Suggested route:** `/[role]/settings` (one page per role, or a shared
`/settings` layout)

**Fields:**
- Display name
- Email (with re-auth confirmation)
- Change password (current + new)
- Preferred language (syncs with the DB column, same as language switcher)
- Low-bandwidth mode toggle (saves to `User` table via a new boolean column)

**Effort:** ~5 hours

---

### 13. Teacher Verification Application Flow

`app/admin/verifications/page.tsx` can approve/reject teachers, but there is no
UI for a teacher to **apply** for verification. Currently a teacher would have to be
promoted by an admin without any formal application.

**What needs to happen:**
- Add a "Apply for Verification" card to `/teacher/page.tsx` (show only if
  `user.isVerified === false`)
- Server action creates a `TeacherProfile` row with `verificationStatus = "PENDING"`
  and notifies all `SUPER_ADMIN` users via `Notification`
- Admin verifications queue already displays `PENDING` profiles — no admin-side changes
  needed

**Effort:** ~3 hours

---

### 14. Class Recordings

`Recording` model exists in the schema but nothing ever creates a row.

**What needs to happen (after video provider decision):**
- If using Jitsi-as-a-Service (JaaS / 8x8): configure recording in the JaaS dashboard;
  recordings are stored in JaaS cloud and a webhook delivers the download URL
- Receive webhook at `/api/webhooks/recording`, create `Recording` row with `url` and
  `classSessionId`
- Surface recordings in `app/teacher/classes/page.tsx` (recording badge already exists
  but only shows if `session.recording != null`) and `app/student/schedule/page.tsx`

**Effort:** ~4 hours (depends on provider)

---

## Tier 3 — Post-Launch / Future

These are real requirements from the PRD but intentionally deferred to keep v1 scope
manageable.

| Feature | Notes |
|---------|-------|
| **Audio-only mode in video classes** | Jitsi supports this via participant UI — no app code needed beyond a UX note |
| **Low-bandwidth mode** | Toggle saved to user preferences; reduces video resolution + hides auto-play media |
| **Subtitle files for resources/recordings** | Upload `.vtt` file alongside resource; surface via HTML `<track>` element |
| **AI recitation feedback** | Out of scope for v1 — requires audio processing pipeline |
| **Native mobile apps** | Only if PWA + responsive web isn't sufficient |
| **Additional languages** | Framework is in place — add a `messages/fr.json` and a new locale entry |
| **Advanced analytics** | Engagement trends, at-risk student detection (beyond the current report charts) |
| **Student discussion replies (admin/teacher moderation)** | Current admin forum only hides/locks — add actual reply editing |
| **Bulk enrollment** | Admin or teacher enroll many students at once from CSV |
| **Waiting list** | Cap group sessions, students join a waitlist |

---

## Open Decisions (Block Tier 1 Work)

These must be resolved before writing code for the relevant items:

1. **Video provider** — `meet.jit.si` (free, zero setup, no recording control) vs.
   **JaaS/8x8** (free 25 MAU, hosted recording + webhooks) vs. **Daily.co** (free 10K
   minutes/month, full recording API). Recommendation: start with `meet.jit.si`; migrate
   to JaaS if recording is needed before launch.

2. **Object storage** — **Cloudflare R2** (10 GB free, zero egress fees, S3-compatible)
   vs. **Backblaze B2** (10 GB free, egress costs) vs. **Supabase Storage** (1 GB free
   on hobby plan). Recommendation: Cloudflare R2.

3. **Email provider** — **Resend** (3,000 emails/month free, dead-simple API, can use
   nodemailer SMTP relay) vs. **Brevo** (300/day free) vs. Hostinger's own SMTP relay
   (check hPanel — often available for free). Recommendation: Resend.

---

## Effort Summary

| Item | Tier | Est. Hours |
|------|------|-----------|
| 1. Live video integration | Must | 4–6 h |
| 2. File/object storage | Must | 6–8 h |
| 3. SMTP credentials & email | Must | 2 h |
| 4. Certificate PDF generation | Must | 5–7 h |
| 5. Cron jobs | Must | 3–4 h |
| 6. Public courses real data | Must | 1 h |
| 7. Production env checklist | Must | 1 h |
| **Tier 1 subtotal** | | **~22–29 h** |
| 8. Optimistic UI | Nice | 3 h |
| 9. Suspense splitting | Nice | 3 h |
| 10. Public page i18n | Nice | 4 h |
| 11. Student forum replies | Nice | 3 h |
| 12. Profile/settings page | Nice | 5 h |
| 13. Teacher verification apply | Nice | 3 h |
| 14. Class recordings | Nice | 4 h |
| **Tier 2 subtotal** | | **~25 h** |
| **Grand total** | | **~47–54 h** |
