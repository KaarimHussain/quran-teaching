# Product Requirements Document (PRD)

## Project Name
Free Quranic Learning Portal

## Mission

Provide free Quranic education worldwide — in English, Urdu, and Arabic — for children,
adults, and new Muslims.

## Background

There is global demand for accessible, free, structured Quranic education. This
platform connects volunteer/professional teachers with students of all ages and
backgrounds, supports live online classes, tracks learning progress across core
Islamic subjects, and keeps parents informed about their children's progress — all
while remaining accessible to users with low-end devices and limited internet
connectivity.

## Goals

1. Make Quranic and Islamic education freely available to anyone, anywhere, in their
   preferred language (English, Urdu, or Arabic).
2. Support structured learning across core courses (Nazra Quran, Tajweed, Hifz-ul-Quran,
   Tafseer, Salah, Islamic Studies) with clear progress tracking.
3. Enable live, interactive teaching (one-to-one and group classes) with scheduling,
   attendance, and homework management.
4. Give parents visibility into their children's attendance, progress, and a channel to
   communicate with teachers.
5. Be usable on low-end devices and slow connections (mobile-friendly, low bandwidth
   mode, audio-only classes).

## User Roles / Personas

### 1. Super Admin
- Manages users (teachers, students, parents), courses, schedules, and overall platform
  activity.
- Verifies/approves teachers (including volunteer teachers) and manages badges.
- Oversees platform-wide reporting and moderation (e.g., community forum).

### 2. Teacher
- Sets availability and conducts live classes (one-to-one and group).
- Assigns and grades homework/assignments.
- Tracks and updates each student's progress (Nazra, Hifz, Tajweed, Tafseer).
- May be a volunteer teacher, subject to verification.

### 3. Student
- Browses/enrolls in courses, attends live classes (or recordings), and progresses
  through learning pathways (Beginner → Intermediate → Advanced).
- Completes homework/assignments and accesses the resource library.
- Earns digital certificates on completion of courses/pathways.

### 4. Parent
- Linked to one or more student accounts (their children).
- Monitors attendance and learning progress.
- Communicates with teachers (messages/notifications) about their child.

## Core Courses

- Nazra Quran
- Tajweed
- Hifz-ul-Quran
- Tafseer
- Salah (Prayer Practice)
- Islamic Studies

## Core Features (Summary)

See `FEATURES.md` for detailed breakdown.

- Multi-language support: English, Urdu, Arabic.
- Live video classes: one-to-one and group.
- Teacher availability scheduling.
- Attendance tracking.
- Homework and assignment management.
- Progress tracking across Nazra, Hifz, Tajweed, and Tafseer.
- Notifications and reminders.
- Parent dashboard.
- Resource library (PDFs, videos, audio lessons).

## Additional Features

- Community discussion forum.
- Digital certificates.
- Class recordings.
- Learning pathways: Beginner, Intermediate, Advanced.
- Volunteer teacher program with teacher verification and badges.

## Accessibility Requirements

- Mobile-friendly design.
- Low bandwidth mode.
- Dark mode.
- Audio-only classes.
- Subtitle support.

## Out of Scope (for initial version)

- Paid subscriptions / payment processing (platform is free).
- Native mobile apps (initial delivery is a responsive web app — see `TECH_SPEC.md`).
- Automated AI-based Quran recitation grading (may be a future consideration).

## Success Metrics

- Students can register, enroll in a course, and join a live class end-to-end.
- Teachers can set availability, run a class, take attendance, and assign homework.
- Parents can view their child's attendance/progress without contacting the teacher
  directly.
- Platform usable (core flows functional) on a low-bandwidth mobile connection.
- Content and UI available in English, Urdu, and Arabic.

## Related Documents

- `FEATURES.md` — detailed feature breakdown & acceptance criteria.
- `DATA_MODEL.md` — entities, fields, relationships.
- `USER_FLOWS.md` — key user journeys.
- `TECH_SPEC.md` — proposed architecture & technology stack.
- `ROADMAP.md` — phased delivery plan.
- `BRAND_GUIDELINES.md` — visual identity (colors, typography).
- `REQUIREMENTS.md` — original source requirements for this project.
