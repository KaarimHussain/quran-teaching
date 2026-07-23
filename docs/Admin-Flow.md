# Admin Flow — Task Tracker

This file tracks every Super Admin feature: what it does (in simple words), which files
implement it, and whether it's **Done** or **Pending**. Update this file whenever admin
functionality changes so the next session knows exactly what's built.

Login as admin at `/login` using the credentials in `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
You land on `/admin` after login.

---

## 1. Admin Dashboard — `/admin` — ✅ Done

**Flow**: Shows an overview of the whole platform at a glance.
- 4 stat cards: Total Users, Total Enrollments, Pending Verifications, Active Courses.
- "Users by Role" breakdown (Students / Teachers / Parents / Super Admins).
- "Enrollments by Course" chart.
- "Course Management" mini-list with enrollment counts + active/inactive badge.
- "Teacher Verifications" — top 3 pending teachers with Approve/Reject buttons right there.
- "Forum Moderation" — latest 2 non-removed posts.

All numbers come live from Prisma (no hardcoded data).

**Files**: `app/admin/page.tsx`

---

## 2. User Management — `/admin/users` — ✅ Done

**Flow**: Admin sees every user on the platform (up to 100, newest-first... actually
oldest-first by signup).
- Search box filters by name or email (`?q=` query param).
- Each row shows name, email, role badge, Active/Suspended badge.
- "Suspend" / "Activate" button toggles `User.isActive`. Admin can't suspend themselves
  (button hidden on their own row).
- Suspended users are blocked from logging in (`login` action checks `isActive`).

**Files**: `app/admin/users/page.tsx`, `app/admin/users/actions.ts` (`toggleUserActive`)

---

## 3. Course Management — `/admin/courses` — ✅ Done

**Flow**: Admin manages the course catalog.
- "Add Course" form — name (required, unique) + optional description. Duplicate name
  shows inline error.
- Course list shows name, description, enrollment count, Active/Inactive badge.
- "Activate" / "Deactivate" button toggles `Course.isActive`. Inactive courses don't
  count toward the dashboard's "Active Courses" stat.

**Files**: `app/admin/courses/page.tsx`, `app/admin/courses/actions.ts`
(`createCourse`, `toggleCourseActive`), `app/admin/courses/create-course-form.tsx`

---

## 4. Teacher Verification — `/admin/verifications` — ✅ Done

**Flow**: Admin reviews teacher signups that need approval before they can teach.
- "Pending Verifications" — full list of teachers with `verificationStatus: PENDING`,
  shows name, email, Volunteer/Paid label, and how long ago they applied.
- Approve → sets `verificationStatus: VERIFIED`. Reject → sets `verificationStatus: REJECTED`.
- "Recently Decided" — last 5 verified/rejected teachers with a status badge and timestamp.
- Approving/rejecting updates the dashboard's "Pending Verifications" count immediately.

**Files**: `app/admin/verifications/page.tsx`, `app/admin/verifications/actions.ts`
(`approveTeacher`, `rejectTeacher` — also reused by the dashboard's mini-queue)

---

## 5. Forum Moderation — `/admin/forum` — ✅ Done

**Flow**: Admin keeps the community forum clean.
- Lists the latest 20 posts (any course or general), with author, course, age, and a
  preview of the body text.
- "Lock" / "Unlock" toggles `ForumPost.isLocked` (locked posts can't receive new replies
  — enforced wherever students post replies).
- "Remove" / "Restore" toggles `ForumPost.isRemoved`. Removed posts disappear from the
  dashboard's forum queue and from student-facing forum views.

**Files**: `app/admin/forum/page.tsx`, `app/admin/forum/actions.ts`
(`toggleForumPostLocked`, `toggleForumPostRemoved`)

---

## 6. Class Schedule — `/admin/schedule` — ✅ Done

**Flow** (per `FEATURES.md`: "Super Admin can view/manage the overall class schedule and
assign teachers to group classes"):
- List all `ClassSession`s — course, teacher, type (One-to-One/Group), scheduled
  start/end, status (Scheduled/Live/Completed/Cancelled). Split into "Upcoming" and
  "Past" sections, or sortable by date.
- "Schedule a Class" form — pick a course, pick a verified teacher, pick type
  (One-to-One/Group), pick start + end date/time. Creates a `ClassSession` with
  `status: SCHEDULED`.
- Cancel button on a scheduled session → sets `status: CANCELLED`. Don't allow
  cancelling sessions that are already `COMPLETED`/`CANCELLED`.

**Files**: `app/admin/schedule/page.tsx`, `app/admin/schedule/actions.ts`,
`app/admin/schedule/create-session-form.tsx`

---

## 7. Reports — `/admin/reports` — ✅ Done

**Flow**: Platform-wide analytics for the admin, all read-only (no actions).
- Enrollment breakdown by status (Active / Completed / Withdrawn).
- Enrollment breakdown by pathway level (Beginner / Intermediate / Advanced).
- Attendance summary: counts + percentage of Present / Absent / Late across all sessions.
- Class session breakdown by status (Scheduled / Live / Completed / Cancelled).
- Certificates issued (total count, optionally recent list).
- Top courses by enrollment count (small table/list).

**Files**: `app/admin/reports/page.tsx`

---

## Reference — Already-built supporting infrastructure (not admin-specific)

- **Auth**: `lib/session.ts`, `lib/password.ts`, `lib/dal.ts`, `app/actions/auth.ts`,
  `proxy.ts` (route protection + redirects). Login/Register/Logout all work.
- **Demo password for all seeded users**: `Password123!`
- **Admin login**: see `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.
