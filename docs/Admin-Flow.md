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

**Flow**: Admin sees every user on the platform (up to 100, oldest-first by signup).
- Search box filters by name or email (`?q=` query param).
- Each row shows name, email, role badge, Active/Suspended badge.
- "Suspend" / "Activate" button toggles `User.isActive`. Admin can't suspend themselves
  (button hidden on their own row).
- Suspended users are blocked from logging in (`login` action checks `isActive`).
- **Parent–Student Links** section: link a parent account to a student account; unlink existing links.

**Files**: `app/admin/users/page.tsx`, `app/admin/users/actions.ts` (`toggleUserActive`),
`app/admin/users/link-parent-form.tsx`, `app/admin/users/link-parent-actions.ts`

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
- **Teacher Badges** section: award a named badge to any VERIFIED teacher (predefined
  suggestions + free text). List all awarded badges with revoke button.

**Files**: `app/admin/verifications/page.tsx`, `app/admin/verifications/actions.ts`
(`approveTeacher`, `rejectTeacher`, `awardBadge`, `revokeBadge`)

---

## 5. Forum Moderation — `/admin/forum` — ✅ Done

**Flow**: Admin keeps the community forum clean.
- Lists the latest 20 posts (any course or general), with author, course, age, and a
  preview of the body text.
- "Lock" / "Unlock" toggles `ForumPost.isLocked` (locked posts can't receive new replies).
- "Remove" / "Restore" toggles `ForumPost.isRemoved`. Removed posts disappear from the
  dashboard's forum queue and from student-facing forum views.

**Files**: `app/admin/forum/page.tsx`, `app/admin/forum/actions.ts`
(`toggleForumPostLocked`, `toggleForumPostRemoved`)

---

## 6. Class Schedule — `/admin/schedule` — ✅ Done

**Flow**: Admin manages the full class schedule including participants and attendance.
- "Schedule a Class" form — pick course, verified teacher, type (One-to-One/Group), start/end.
- Upcoming sessions list with Cancel button.
- Past sessions list.
- **Manage Participants**: add/remove students from SCHEDULED sessions (creates `ClassParticipant` records).
- **Mark/Override Attendance**: record or correct `Attendance` for any COMPLETED session
  (PRESENT / ABSENT / LATE). Uses upsert so records can be overridden. Recent records shown below.

**Files**: `app/admin/schedule/page.tsx`, `app/admin/schedule/actions.ts`
(`createClassSession`, `cancelClassSession`, `addClassParticipant`, `removeClassParticipant`, `upsertAttendance`),
`app/admin/schedule/create-session-form.tsx`

---

## 7. Reports — `/admin/reports` — ✅ Done

**Flow**: Platform-wide analytics for the admin, all read-only (no actions).
- Enrollment breakdown by status (Active / Completed / Withdrawn).
- Enrollment breakdown by pathway level (Beginner / Intermediate / Advanced).
- Attendance summary: counts + percentage of Present / Absent / Late across all sessions.
- Class session breakdown by status (Scheduled / Live / Completed / Cancelled).
- Certificates issued (total count, recent list).
- Top courses by enrollment count.

**Files**: `app/admin/reports/page.tsx`

---

## 8. Certificates — `/admin/certificates` — ✅ Done

**Flow**: Admin manually issues and revokes digital certificates.
- Stat cards: total certificates issued, unique students certified.
- "Issue Certificate" form — pick student (active students), pick course (active courses),
  pick pathway level (Beginner / Intermediate / Advanced). Validates that the student is
  enrolled in the course and that a cert doesn't already exist.
- Certificate list showing student, course, level, issue date — with revoke button.
- Revoking deletes the certificate and revalidates the student's certificates page.

**Files**: `app/admin/certificates/page.tsx`, `app/admin/certificates/actions.ts`
(`issueCertificate`, `revokeCertificate`), `app/admin/certificates/issue-form.tsx`

---

## 9. Announcements — `/admin/announcements` — ✅ Done

**Flow**: Admin broadcasts messages to platform users.
- Stat cards: total recipients (all users), total announcement notifications sent.
- "Send Announcement" form — audience selector (All Users / Students / Teachers / Parents /
  Super Admins), message textarea (min 5 chars). On submit, creates one `Notification`
  record (type: `ANNOUNCEMENT`) per matching user. Success message shows count sent.
- "Announcement History" — last 10 distinct messages sent (grouped by message text),
  showing recipient count and time sent.

**Files**: `app/admin/announcements/page.tsx`, `app/admin/announcements/actions.ts`
(`sendAnnouncement`), `app/admin/announcements/announcement-form.tsx`

---

## Reference — Already-built supporting infrastructure (not admin-specific)

- **Auth**: `lib/session.ts`, `lib/password.ts`, `lib/dal.ts`, `app/actions/auth.ts`,
  `proxy.ts` (route protection + redirects). Login/Register/Logout all work.
- **Demo password for all seeded users**: `Password123!`
- **Admin login**: see `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.
- **SubmitButton**: `components/ui/submit-button.tsx` — all action buttons use this for
  pending state (spinner + disabled during submission).
