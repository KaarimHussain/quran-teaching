# Teacher Flow — Task Tracker

This file tracks every Teacher feature: what it does (in simple words), which files
implement it, and whether it's **Done** or **Pending**. Update this file whenever teacher
functionality changes so the next session knows exactly what's built.

Log in as a teacher at `/login`. Verified teacher demo accounts (password `Password123!`):
- `tariq.mehmood@quranlearning.org` — Ustadh Tariq Mehmood (Tajweed)
- `khadija.noor@quranlearning.org` — Sister Khadija Noor (Nazra Quran)
- `bilal.rahman@quranlearning.org` — Ustadh Bilal Rahman (Hifz-ul-Quran)

`imran.sheikh@quranlearning.org` is still **PENDING** verification — useful for testing
the "not yet verified" state.

A teacher's "courses" are derived from the courses they have `ClassSession`s in (there is
no direct `Course.teacherUserId` field in the schema) — see `lib/teacher.ts`.

---

## 1. Teacher Dashboard — `/teacher` — ✅ Done

**Flow**: Overview of the teacher's day at a glance, all live data.
- 4 stat cards: Active Students (distinct students across the teacher's classes),
  Classes This Week, Pending Grading (submissions awaiting review), Badges Earned.
- "Today's Schedule" — sessions for today/upcoming with participant avatars and a
  join/attendance shortcut.
- "Assignments to Grade" — latest SUBMITTED submissions for the teacher's assignments.
- "My Students" — roster preview with avatar, course, and a progress bar from their
  latest `ProgressEntry`.
- Availability summary pulled from `TeacherAvailability`.
- Verification status badge (Verified / Pending / Rejected) from `User.verificationStatus`.

**Files**: `app/teacher/page.tsx`

---

## 2. Availability — `/teacher/availability` — ✅ Done

**Flow** (per `FEATURES.md` §3 — "A class cannot be booked outside a teacher's declared
availability" / "A teacher cannot be double-booked"):
- Weekly grid showing the teacher's recurring `TeacherAvailability` windows
  (day of week + start/end time).
- "Add Availability" form — pick day of week, start time, end time. Rejects overlapping
  windows on the same day with an inline error.
- Remove button on each window.

**Files**: `app/teacher/availability/page.tsx`, `app/teacher/availability/actions.ts`,
`app/teacher/availability/availability-form.tsx`

---

## 3. Classes — `/teacher/classes` — ✅ Done

**Flow** (per `FEATURES.md` §4/§5 — live classes + attendance):
- "Upcoming Sessions" — the teacher's `ClassSession`s with course, type, time, and
  participant avatars.
- "Past Sessions" — completed sessions with an "attendance recorded / pending" indicator.
- Per completed session: "Mark Attendance" — a row per enrolled participant with
  Present / Absent / Late buttons that write to `Attendance` (upsert,
  `markedByUserId` = current teacher).

**Files**: `app/teacher/classes/page.tsx`, `app/teacher/classes/actions.ts`

---

## 4. Students — `/teacher/students` — ✅ Done

**Flow** (per `FEATURES.md` §7 — progress tracking):
- Roster of every student enrolled in the teacher's courses, grouped by course, with
  avatar, pathway level badge, and a progress bar from their latest `ProgressEntry`
  percent for that course's subject area.
- "Add Progress Update" form per student — subject area, description, level, percent
  complete. Creates a `ProgressEntry` with `recordedByUserId` = current teacher.

**Files**: `app/teacher/students/page.tsx`, `app/teacher/students/actions.ts`,
`app/teacher/students/progress-form.tsx`

---

## 5. Assignments — `/teacher/assignments` — ✅ Done

**Flow** (per `FEATURES.md` §6 — homework & assignment management):
- "Create Assignment" form — course (one of the teacher's courses), title, description,
  due date. Creates an `Assignment`.
- List of the teacher's assignments with a submission-progress bar
  (reviewed / submitted / not submitted counts).
- Per assignment, list of `Submission`s needing review — "Grade" form (grade text +
  feedback textarea) sets `status: REVIEWED`.

**Files**: `app/teacher/assignments/page.tsx`, `app/teacher/assignments/actions.ts`,
`app/teacher/assignments/create-assignment-form.tsx`,
`app/teacher/assignments/grade-form.tsx`

---

## 6. Resources — `/teacher/resources` — ✅ Done

**Flow** (per `FEATURES.md` §10 — resource library):
- Grid of `Resource`s the teacher has uploaded, grouped by course, with type icon
  (PDF/Video/Audio) and a visual type badge.
- "Upload Resource" form — course (optional, one of the teacher's courses), type, title,
  description, URL. Creates a `Resource` with `uploadedByUserId` = current teacher.

**Files**: `app/teacher/resources/page.tsx`, `app/teacher/resources/actions.ts`,
`app/teacher/resources/upload-resource-form.tsx`

---

## 7. Forum — `/teacher/forum` — ✅ Done

**Flow** (per `FEATURES.md` §12 — community discussion forum):
- List of non-removed `ForumPost`s (general + the teacher's courses) with author avatar,
  category badge, reply count.
- "New Discussion" form — title, body, optional course. Creates a `ForumPost`.
- Expand a thread to view/add `ForumReply`s.

**Files**: `app/teacher/forum/page.tsx`, `app/teacher/forum/actions.ts`,
`app/teacher/forum/new-post-form.tsx`, `app/teacher/forum/reply-form.tsx`

---

## Reference — Already-built supporting infrastructure (not teacher-specific)

- **Auth**: `lib/session.ts`, `lib/password.ts`, `lib/dal.ts`, `app/actions/auth.ts`,
  `proxy.ts` (route protection + redirects). Login/Register/Logout all work.
- **Demo password for all seeded users**: `Password123!`
- **Charts**: `components/charts/enrollment-chart.tsx`,
  `components/charts/weekly-activity-chart.tsx`,
  `components/charts/distribution-pie-chart.tsx`
