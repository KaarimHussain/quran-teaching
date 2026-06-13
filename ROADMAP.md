# Roadmap

Phased delivery plan for the Free Quranic Learning Portal. Each phase builds on the
previous one; scope can be re-prioritized based on feedback after each phase.

## Phase 1 — Foundations

Goal: users can register, log in, and the basic structure (roles, courses, language)
exists.

- Authentication with roles: `SUPER_ADMIN`, `TEACHER`, `STUDENT`, `PARENT`.
- Multi-language UI shell (English, Urdu, Arabic) with RTL support.
- Course catalog (Nazra Quran, Tajweed, Hifz-ul-Quran, Tafseer, Salah, Islamic Studies).
- Student enrollment in courses with pathway level (Beginner/Intermediate/Advanced).
- Parent-student account linking.
- Dark mode (using existing brand theme tokens).
- Resource library v1 (PDF/video/audio upload & browsing, filterable by course/
  language).

**Outcome**: platform is usable for browsing courses and resources in all three
languages, with accounts for every role.

## Phase 2 — Scheduling & Live Classes

Goal: teachers and students can schedule and attend live classes.

- Teacher availability management.
- Class scheduling: one-to-one booking and group class sessions.
- Live video classes (one-to-one and group), including **audio-only mode** and **low
  bandwidth mode**.
- Class recordings, linked to sessions and access-controlled.
- Attendance tracking (auto + teacher override).
- Class reminder notifications.

**Outcome**: addresses the core "live video classes" and "attendance tracking"
requirements.

## Phase 3 — Learning Management

Goal: homework, progress tracking, and parent visibility are fully functional.

- Homework/assignment creation, submission (text/file/audio), and grading.
- Progress tracking per subject area (Nazra, Hifz, Tajweed, Tafseer) with timeline view.
- Parent dashboard: attendance, progress, homework status, messaging with teachers.
- Notifications: homework assigned/graded, progress updates, messages.
- Subtitle support for video resources/recordings.

**Outcome**: addresses "Homework and assignment management", "Progress tracking", and
"Parent dashboard" requirements.

## Phase 4 — Community & Recognition

Goal: round out the platform with community features, certification, and teacher
program management.

- Community discussion forum (with Super Admin moderation).
- Digital certificates (issuance tied to progress/attendance criteria).
- Volunteer teacher program: application flow, Super Admin verification, badges.
- Super Admin reporting dashboards (platform activity, completion rates, active
  users).

**Outcome**: addresses "Community discussion forum", "Digital certificates", "Volunteer
teacher program", and "Teacher verification and badges".

## Future Considerations (post-v1, not yet scoped)

- AI-assisted Quran recitation feedback/grading.
- Native mobile apps (if responsive PWA isn't sufficient).
- Additional languages beyond English/Urdu/Arabic.
- Advanced analytics (e.g., engagement trends, at-risk student detection).
