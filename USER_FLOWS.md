# Key User Flows

Reference flows for the Free Quranic Learning Portal. See `FEATURES.md` for the
features involved and `DATA_MODEL.md` for the entities referenced.

---

## 1. Student Registration & Enrollment

1. New user registers, selects role `STUDENT` (or is registered by a parent), and sets
   their preferred language (English/Urdu/Arabic) — UI adapts (RTL for Urdu/Arabic).
2. Student browses the course catalog (Nazra Quran, Tajweed, Hifz-ul-Quran, Tafseer,
   Salah, Islamic Studies).
3. Student enrolls in a course, optionally selecting a starting pathway level
   (Beginner/Intermediate/Advanced).
4. Student lands on their dashboard showing enrolled courses, upcoming classes (none
   yet), and resource library access for that course.

---

## 2. Teacher Sets Availability & Is Assigned Classes

1. Teacher (verified — see Flow 8) logs in and opens **Availability**.
2. Teacher defines recurring weekly time slots (and/or one-off slots for specific
   dates).
3. Super Admin (or the booking flow in Flow 3) schedules a `ClassSession` within the
   teacher's available slots, for a specific course and type (`ONE_TO_ONE` or `GROUP`).
4. Teacher sees the new session on their schedule/dashboard.

---

## 3. Student Books / Joins a Class

1. Student opens **Schedule** for an enrolled course.
2. For a **one-to-one** class: student picks an available teacher slot → a
   `ClassSession` is created with the student as the sole `ClassParticipant`.
3. For a **group** class: student joins an existing scheduled `ClassSession` (added as a
   `ClassParticipant`).
4. At the scheduled time, both student and teacher receive a reminder notification
   (`CLASS_REMINDER`).
5. Participants join the live video room via `joinUrl`. Students with slow connections
   can switch to **audio-only mode**.
6. Teacher marks the session `LIVE`, then `COMPLETED` once finished. A `Recording` is
   generated and linked to the `ClassSession`.

---

## 4. Attendance Recording

1. During/after a `ClassSession`, the system auto-marks `Attendance` based on join/leave
   events for each `ClassParticipant`.
2. Teacher reviews and can override attendance status (`PRESENT`/`ABSENT`/`LATE`) before
   finalizing.
3. Attendance becomes visible to: the student, their linked parent(s) (via Parent
   Dashboard), and Super Admin (reporting).

---

## 5. Homework Assignment & Submission

1. Teacher creates an `Assignment` for a course (optionally tied to a specific
   `ClassSession`): title, description, due date.
2. Enrolled students receive a `HOMEWORK_ASSIGNED` notification.
3. Student opens the assignment and creates a `Submission` (text, file, or audio
   recording — e.g., for recitation practice).
4. Teacher reviews submissions, sets `status = REVIEWED` with grade/feedback.
5. Student (and linked parent) receive a `HOMEWORK_GRADED` notification and can view
   feedback.

---

## 6. Progress Tracking Update

1. After a class (or periodically), the teacher opens a student's profile.
2. Teacher adds a `ProgressEntry` for a `subjectArea` (Nazra, Hifz, Tajweed, or Tafseer) —
   e.g., "Completed Surah Al-Fatiha", with a level/percent-complete indicator.
3. The entry appears on:
   - The student's own progress timeline/dashboard.
   - The linked parent's dashboard for that child.
4. Accumulated progress may update the student's `pathwayLevel` for the course (e.g.,
   Beginner → Intermediate), subject to defined criteria.

---

## 7. Parent Dashboard & Teacher Communication

1. Parent logs in; dashboard shows a selector for each linked child (`ParentStudentLink`).
2. For the selected child, parent sees: enrolled courses, attendance summary, progress
   summary (per subject area), upcoming classes, homework status.
3. Parent sends a message to the child's teacher (e.g., asking about progress); teacher
   receives a `MESSAGE` notification and can reply.

---

## 8. Volunteer Teacher Application & Verification

1. Prospective teacher registers, selects role `TEACHER`, and indicates
   `isVolunteer = true` (if applicable).
2. `verificationStatus` is set to `PENDING` — teacher cannot yet be booked/assigned
   classes.
3. Super Admin reviews the application (credentials, etc.) and sets
   `verificationStatus = VERIFIED` (or `REJECTED`).
4. Super Admin may award `TeacherBadge`s (e.g., "Verified", "Hifz Specialist") which
   display on the teacher's profile.
5. Once verified, the teacher can set availability (Flow 2) and be assigned/booked for
   classes (Flow 3).

---

## 9. Resource Library Access

1. Student (or any role) opens **Resource Library**, optionally filtered by course and
   language (English/Urdu/Arabic).
2. Student opens a resource:
   - `PDF` — viewed/downloaded.
   - `VIDEO`/`AUDIO` — streamed; video resources can show subtitles in available
     languages.
3. Teachers/Super Admin can upload new resources, associating them with a course and
   language, and attaching subtitle files for videos.

---

## 10. Certificate Issuance

1. As a student progresses (Flow 6) and meets completion criteria for a course/pathway
   level (e.g., sufficient `ProgressEntry` coverage + attendance), the system (or
   teacher/Super Admin action) issues a `Certificate`.
2. Student receives a `CERTIFICATE_ISSUED` notification.
3. Certificate appears on the student's dashboard and can be downloaded/shared.

---

## 11. Community Forum Participation

1. Any authenticated user opens the **Community Forum**, optionally filtered by course
   topic.
2. User creates a `ForumPost` (question/discussion) or replies (`ForumReply`) to an
   existing post.
3. Super Admin can moderate: lock a thread (`isLocked`) or remove content
   (`isRemoved`) that violates guidelines.

---

## 12. Super Admin Platform Management

1. Super Admin logs in to an admin dashboard showing: total users by role, course
   enrollment numbers, upcoming/ongoing class sessions, pending teacher verifications,
   and forum moderation queue.
2. Super Admin manages courses (create/edit/deactivate), users (activate/deactivate
   accounts), and oversees the overall schedule (Flow 2–3).
3. Super Admin reviews platform activity reports (attendance rates, completion rates,
   active teachers/students).
