# Feature Specification

Detailed feature breakdown for the Free Quranic Learning Portal, with user stories and
acceptance criteria. See `PRD.md` for context and `DATA_MODEL.md` for the underlying
entities.

Legend: **[SA]** Super Admin, **[T]** Teacher, **[S]** Student, **[P]** Parent.

---

## 1. Authentication, Roles & Multi-Language **[SA+T+S+P]**

- **User story**: As a user, I can register/log in and choose my preferred language
  (English, Urdu, or Arabic) so the platform is usable in my language.

Features:
- Registration/login for all roles.
- Role-based access: `SUPER_ADMIN`, `TEACHER`, `STUDENT`, `PARENT`.
- Language preference (English/Urdu/Arabic) stored per user; UI and content localized
  accordingly (Arabic/Urdu require RTL layout support).
- Parent accounts can be linked to one or more student accounts.

**Acceptance criteria**
- A user can switch language and the UI (including RTL for Arabic/Urdu) updates
  accordingly.
- A `PARENT` can only view data for students linked to their account.

---

## 2. Course Catalog & Enrollment **[SA+S]**

- **User story (Student)**: As a student, I want to browse available courses and enroll
  in the ones I want to learn.
- **User story (Super Admin)**: As a super admin, I want to manage the list of courses
  offered.

Features:
- Course catalog: Nazra Quran, Tajweed, Hifz-ul-Quran, Tafseer, Salah, Islamic Studies.
- Each course has a learning pathway level: Beginner, Intermediate, Advanced.
- Students enroll in a course (and are placed in/choose a pathway level).
- Super Admin can create/edit/deactivate courses.

**Acceptance criteria**
- A student can see their enrolled courses and current pathway level per course.
- Super Admin changes to a course (e.g., deactivating it) don't delete historical
  enrollment/progress data.

---

## 3. Teacher Availability & Scheduling **[SA+T+S]**

- **User story (Teacher)**: As a teacher, I want to set my available time slots so
  students/admins can schedule classes with me.
- **User story (Student)**: As a student, I want to see available class times and book
  a one-to-one or join a group class.

Features:
- Teachers define recurring/one-off availability windows.
- Classes can be **one-to-one** (student books a slot with a teacher) or **group**
  (scheduled session multiple students join).
- Super Admin can view/manage the overall class schedule and assign teachers to group
  classes.

**Acceptance criteria**
- A class cannot be booked outside a teacher's declared availability.
- A teacher cannot be double-booked for overlapping classes.

---

## 4. Live Video Classes **[T+S]**

- **User story**: As a student, I want to join a live video class (one-to-one or group)
  at its scheduled time.
- **User story (Teacher)**: As a teacher, I want to start/host the class and have it
  recorded for students who couldn't attend.

Features:
- Live video session linked to a scheduled class (`ClassSession`).
- Support for one-to-one and group video sessions.
- **Class recordings** are saved and made available afterward (see Feature 11).
- **Audio-only mode** for low-bandwidth users (Accessibility, see Feature 13).

**Acceptance criteria**
- A class session has a join link/room available only to enrolled participants and the
  assigned teacher.
- Recordings are automatically associated with the class session and visible to
  enrolled students afterward.

---

## 5. Attendance Tracking **[T+S+P+SA]**

- **User story (Teacher)**: As a teacher, I want to mark attendance for each class so
  records are kept automatically.
- **User story (Parent)**: As a parent, I want to see my child's attendance history.

Features:
- Attendance recorded per student per class session (`present`, `absent`, `late`).
- Auto-marking based on join/leave events where possible, with teacher override.
- Attendance visible to: the student, their linked parent(s), the teacher, and Super
  Admin.

**Acceptance criteria**
- Every completed class session has an attendance record for each enrolled student.
- Parent dashboard shows attendance history per child per course.

---

## 6. Homework & Assignment Management **[T+S]**

- **User story (Teacher)**: As a teacher, I want to assign homework to my students and
  review their submissions.
- **User story (Student)**: As a student, I want to see my assigned homework, submit my
  work, and see feedback/grades.

Features:
- Teacher creates assignments (title, description, due date, related course/class).
- Students submit work (text, file upload, or audio recording — relevant for recitation
  practice).
- Teacher reviews submissions and provides feedback/grade/status.

**Acceptance criteria**
- A student only sees assignments for courses they're enrolled in.
- Submission status (`not submitted`, `submitted`, `reviewed`) is visible to student,
  teacher, and parent.

---

## 7. Progress Tracking **[T+S+P+SA]**

- **User story (Teacher)**: As a teacher, I want to record a student's progress in
  Nazra, Hifz, Tajweed, and Tafseer so it's visible over time.
- **User story (Student/Parent)**: As a student or parent, I want to see progress over
  time for each subject.

Features:
- Progress entries per student, per subject area (Nazra, Hifz, Tajweed, Tafseer), with a
  status/level and optional notes (e.g., "completed Surah X", "Tajweed rule Y mastered").
- Progress contributes to a student's overall pathway level (Beginner/Intermediate/
  Advanced) per course.
- Visualized as a timeline/progress chart on student and parent dashboards.

**Acceptance criteria**
- Only the assigned teacher (or Super Admin) can record/update progress entries.
- Students and linked parents can view (read-only) progress history.

---

## 8. Notifications & Reminders **[SA+T+S+P]**

- **User story**: As a user, I want to be reminded about upcoming classes, new homework,
  and important updates.

Features:
- Notification types: upcoming class reminder, new homework assigned, homework graded,
  attendance recorded, new message/announcement, certificate issued.
- Delivered in-app (and optionally via email — see `TECH_SPEC.md`).
- Respect user language preference.

**Acceptance criteria**
- A student/parent receives a reminder before a scheduled class.
- A teacher is notified when a student submits homework.

---

## 9. Parent Dashboard **[P]**

- **User story**: As a parent, I want a single view of my child's (or children's)
  attendance, progress, homework status, and a way to message their teacher.

Features:
- Overview per linked student: enrolled courses, attendance summary, progress summary,
  upcoming classes, homework status.
- Messaging/communication channel with the student's teacher(s).
- Switch between multiple children if more than one is linked.

**Acceptance criteria**
- A parent only sees data for students explicitly linked to their account.
- A parent can send a message to a teacher and see replies.

---

## 10. Resource Library **[SA+T+S]**

- **User story**: As a student, I want to access supplementary PDFs, videos, and audio
  lessons for self-study.

Features:
- Resource entries: type (`PDF`, `VIDEO`, `AUDIO`), title, description, associated
  course (optional), language.
- Teachers/Super Admin upload/manage resources; students browse and consume them.
- Resources support **subtitle files** for video content (Accessibility, Feature 13).

**Acceptance criteria**
- Resources can be filtered by course and language.
- A student can stream/download a resource appropriate to their enrolled courses.

---

## 11. Class Recordings **[T+S+SA]**

- **User story**: As a student, I want to watch a recording of a class I missed.

Features:
- Each completed class session can have an associated recording.
- Recordings respect enrollment — only students enrolled in that class (or course) can
  view it.
- Super Admin can manage/remove recordings (e.g., for storage or privacy reasons).

**Acceptance criteria**
- A recording is automatically linked to its `ClassSession` once available.
- Access to a recording is restricted to participants of that session (and Super Admin).

---

## 12. Community Discussion Forum **[SA+T+S+P]**

- **User story**: As a student (or parent/teacher), I want to ask questions and discuss
  topics with the community.

Features:
- Forum organized by topic/course (optional association).
- Users can create posts and reply to others.
- Super Admin can moderate (edit/remove posts, lock threads).

**Acceptance criteria**
- All authenticated roles can read and post (subject to moderation rules).
- Super Admin can remove inappropriate content.

---

## 13. Accessibility Features **[SA+T+S+P]**

- **Mobile-friendly design**: all pages usable on small screens.
- **Low bandwidth mode**: reduces video quality/data usage; may default to audio-only.
- **Dark mode**: theme toggle, consistent with `BRAND_GUIDELINES.md` dark-mode tokens.
- **Audio-only classes**: students can join a live class as audio-only (no video
  stream).
- **Subtitle support**: video resources and recordings can have subtitle tracks
  (multi-language, aligned with English/Urdu/Arabic support).

**Acceptance criteria**
- A user can enable low-bandwidth/audio-only mode before/during a class.
- Dark mode preference persists across sessions.
- Subtitles can be toggled on/off and switched between available languages.

---

## 14. Digital Certificates **[S+SA]**

- **User story**: As a student, I want to receive a certificate when I complete a course
  or pathway level.

Features:
- Certificate generated/issued on completion of a course or pathway level (criteria
  defined by Super Admin/teacher, e.g., progress + attendance thresholds).
- Certificate viewable/downloadable from the student dashboard.

**Acceptance criteria**
- A certificate references the student, course/pathway, and completion date.
- Certificates are only issued once completion criteria are met.

---

## 15. Volunteer Teacher Program & Verification **[SA+T]**

- **User story (Teacher)**: As a volunteer, I want to apply to teach and get verified so
  I can be assigned classes.
- **User story (Super Admin)**: As a super admin, I want to review and verify volunteer
  teacher applications and award badges.

Features:
- Teacher application/onboarding flow (volunteer vs. regular teacher).
- Super Admin verification step before a teacher can be assigned classes.
- Teacher badges (e.g., "Verified", "Hifz Specialist") displayed on teacher profiles.

**Acceptance criteria**
- An unverified teacher cannot be booked/assigned for classes.
- Super Admin can approve/reject applications and assign/revoke badges.

---

## Non-Functional Requirements

- **Mobile-first, responsive** UI across all roles.
- **Multi-language (English, Urdu, Arabic)** including RTL layout support for Urdu and
  Arabic.
- **Role-based access control** enforced server-side.
- **Low bandwidth & audio-only** support for live classes and media.
- **Dark mode** using existing theme tokens (`app/globals.css`, `BRAND_GUIDELINES.md`).
- **Auditability**: attendance, progress entries, and certificate issuance are
  timestamped and attributed to the acting user (teacher/admin).
