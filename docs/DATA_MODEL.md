# Data Model

Proposed entities and relationships for the Free Quranic Learning Portal. Field types
are illustrative — the final schema will depend on the chosen database/ORM (see
`TECH_SPEC.md`).

## Entity Overview

```
User (SuperAdmin | Teacher | Student | Parent)
  ├─< ParentStudentLink >─ User (Student)
  ├─< Enrollment >─ Course
  ├─< TeacherAvailability        (Teacher only)
  ├─< ClassSession (as teacher / as participant)
  ├─< Attendance
  ├─< Assignment (created by Teacher) / Submission (by Student)
  ├─< ProgressEntry
  ├─< Notification
  ├─< Certificate
  ├─< ForumPost / ForumReply
  └─< TeacherBadge                (Teacher only)

Course
  ├─< Enrollment
  ├─< ClassSession
  ├─< Assignment
  ├─< Resource
  └─< Certificate

ClassSession
  ├─< Attendance (per student)
  └─ Recording (1:1, optional)
```

---

## User

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `name` | string | Full name |
| `email` | string | Unique, used for login |
| `passwordHash` | string | Hashed credential |
| `role` | enum: `SUPER_ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | |
| `preferredLanguage` | enum: `EN`, `UR`, `AR` | Drives UI language/RTL |
| `isActive` | boolean | |
| `createdAt` / `updatedAt` | datetime | |

### Teacher-specific fields (on `User` or a `TeacherProfile`)
| Field | Type | Notes |
| --- | --- | --- |
| `isVolunteer` | boolean | Volunteer vs. regular teacher |
| `verificationStatus` | enum: `PENDING`, `VERIFIED`, `REJECTED` | Set by Super Admin |
| `badges` | string[] / relation to `TeacherBadge` | e.g., "Verified", "Hifz Specialist" |

---

## ParentStudentLink

Links a `PARENT` user to one or more `STUDENT` users.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `parentUserId` | UUID (FK -> User, role=PARENT) | |
| `studentUserId` | UUID (FK -> User, role=STUDENT) | |
| `createdAt` | datetime | |

---

## Course

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `name` | enum/string | Nazra Quran, Tajweed, Hifz-ul-Quran, Tafseer, Salah, Islamic Studies |
| `description` | text | |
| `isActive` | boolean | Super Admin can deactivate without deleting history |
| `createdAt` / `updatedAt` | datetime | |

---

## Enrollment

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `studentUserId` | UUID (FK -> User, role=STUDENT) | |
| `courseId` | UUID (FK -> Course) | |
| `pathwayLevel` | enum: `BEGINNER`, `INTERMEDIATE`, `ADVANCED` | |
| `enrolledAt` | datetime | |
| `status` | enum: `ACTIVE`, `COMPLETED`, `WITHDRAWN` | |

---

## TeacherAvailability

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `teacherUserId` | UUID (FK -> User, role=TEACHER) | |
| `dayOfWeek` | enum/int | For recurring slots |
| `startTime` / `endTime` | time | |
| `isRecurring` | boolean | One-off vs. recurring slot |
| `specificDate` | date | Used when `isRecurring = false` |

---

## ClassSession

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `courseId` | UUID (FK -> Course) | |
| `teacherUserId` | UUID (FK -> User, role=TEACHER) | |
| `type` | enum: `ONE_TO_ONE`, `GROUP` | |
| `scheduledStart` / `scheduledEnd` | datetime | |
| `status` | enum: `SCHEDULED`, `LIVE`, `COMPLETED`, `CANCELLED` | |
| `joinUrl` / `roomId` | string | Video session reference |
| `createdAt` / `updatedAt` | datetime | |

### ClassParticipant (for group classes / one-to-one booking)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `classSessionId` | UUID (FK -> ClassSession) | |
| `studentUserId` | UUID (FK -> User, role=STUDENT) | |

---

## Recording

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `classSessionId` | UUID (FK -> ClassSession, unique) | |
| `url` | string | Storage location |
| `durationSeconds` | int | |
| `createdAt` | datetime | |

---

## Attendance

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `classSessionId` | UUID (FK -> ClassSession) | |
| `studentUserId` | UUID (FK -> User, role=STUDENT) | |
| `status` | enum: `PRESENT`, `ABSENT`, `LATE` | |
| `markedByUserId` | UUID (FK -> User) | Teacher or auto-system |
| `recordedAt` | datetime | |

---

## Assignment (Homework)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `courseId` | UUID (FK -> Course) | |
| `classSessionId` | UUID (FK -> ClassSession) | Optional — assignment tied to a specific class |
| `teacherUserId` | UUID (FK -> User, role=TEACHER) | Creator |
| `title` | string | |
| `description` | text | |
| `dueDate` | date | |
| `createdAt` | datetime | |

## Submission

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `assignmentId` | UUID (FK -> Assignment) | |
| `studentUserId` | UUID (FK -> User, role=STUDENT) | |
| `contentType` | enum: `TEXT`, `FILE`, `AUDIO` | Audio useful for recitation practice |
| `content` | text/string | Text content or file/audio URL |
| `status` | enum: `NOT_SUBMITTED`, `SUBMITTED`, `REVIEWED` | |
| `grade` / `feedback` | string / text | Set by teacher |
| `submittedAt` / `reviewedAt` | datetime | |

---

## ProgressEntry

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `studentUserId` | UUID (FK -> User, role=STUDENT) | |
| `courseId` | UUID (FK -> Course) | |
| `subjectArea` | enum: `NAZRA`, `HIFZ`, `TAJWEED`, `TAFSEER` | |
| `description` | string | e.g., "Completed Surah Al-Baqarah", "Mastered rule of Ghunnah" |
| `level` / `percentComplete` | string / number | Progress indicator |
| `recordedByUserId` | UUID (FK -> User, role=TEACHER or SUPER_ADMIN) | |
| `recordedAt` | datetime | |

---

## Notification

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `userId` | UUID (FK -> User) | Recipient |
| `type` | enum: `CLASS_REMINDER`, `HOMEWORK_ASSIGNED`, `HOMEWORK_GRADED`, `ATTENDANCE_RECORDED`, `MESSAGE`, `CERTIFICATE_ISSUED`, `ANNOUNCEMENT` | |
| `message` | text | Localized per `User.preferredLanguage` |
| `isRead` | boolean | |
| `createdAt` | datetime | |

---

## Resource (Library)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `courseId` | UUID (FK -> Course) | Optional |
| `type` | enum: `PDF`, `VIDEO`, `AUDIO` | |
| `title` / `description` | string / text | |
| `url` | string | Storage location |
| `language` | enum: `EN`, `UR`, `AR` | |
| `subtitleUrls` | map<language, string> | Optional, for `VIDEO` |
| `uploadedByUserId` | UUID (FK -> User) | Teacher or Super Admin |
| `createdAt` | datetime | |

---

## ForumPost / ForumReply

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `courseId` | UUID (FK -> Course) | Optional topic association |
| `authorUserId` | UUID (FK -> User) | |
| `title` | string | (ForumPost only) |
| `body` | text | |
| `parentPostId` | UUID (FK -> ForumPost) | (ForumReply only) |
| `isLocked` / `isRemoved` | boolean | Moderation, by Super Admin |
| `createdAt` | datetime | |

---

## Certificate

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `studentUserId` | UUID (FK -> User, role=STUDENT) | |
| `courseId` | UUID (FK -> Course) | |
| `pathwayLevel` | enum: `BEGINNER`, `INTERMEDIATE`, `ADVANCED` | |
| `issuedAt` | datetime | |
| `certificateUrl` | string | Generated PDF/image |

---

## TeacherBadge

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `teacherUserId` | UUID (FK -> User, role=TEACHER) | |
| `badgeName` | string | e.g., "Verified", "Hifz Specialist" |
| `awardedByUserId` | UUID (FK -> User, role=SUPER_ADMIN) | |
| `awardedAt` | datetime | |

---

## CurriculumLevel

One of the 22 levels of the Quranic & Islamic curriculum (`docs/Quran App Curriclum.docx`).
Content is seeded from `lib/curriculum/data.ts` via `npm run db:seed:curriculum`.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `number` | int (unique) | 1–22 |
| `title` / `subtitle` | string | e.g. "Tajweed Foundation" / "Correct Quranic Pronunciation" |
| `purpose` | text | Level purpose; Level 22 carries the Ijazah disclaimer |
| `methodologyNote` | text | Shown to students as a callout (Fiqh school for Level 12, dua sourcing for Level 16) |
| `minAge` | int? | Level 19 = 16 (displayed, not enforced) |
| `courseId` | FK → Course | The track course the level belongs to (see table below) |
| `createdAt` / `updatedAt` | datetime | |

| Track course | Levels |
| --- | --- |
| Quran Reading | 1–3 |
| Tajweed | 4–5 |
| Hifz-ul-Quran | 6–7 |
| Quran Understanding | 8–10 |
| Islamic Studies | 11–18 |
| Advanced Quranic Studies | 19–21 |
| Quran Teacher Preparation | 22 |

---

## CourseModule (curriculum fields)

Existing self-paced modules gain curriculum structure. Modules with `levelId = null`
are legacy admin-created modules and are never gated.

| Field | Type | Notes |
| --- | --- | --- |
| `levelId` | FK → CurriculumLevel? | `SET NULL` on level delete |
| `code` | string? (unique) | e.g. `"1.1"` — the seed matches on this |
| `subjects` | JSON `string[]` | "What You Learn" |
| `mandatoryLearning` | JSON `string[]` | What the student must demonstrate |
| `practice` | JSON `string[]` | |
| `assessment` | JSON `string[]` | |
| `isGated` | boolean (default true) | Requires teacher sign-off before the next module unlocks |

---

## ModuleSignOff

A teacher's confirmation that a student has met a module's Mandatory Learning / Assessment.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `studentUserId` | FK → User | |
| `moduleId` | FK → CourseModule | Unique together with `studentUserId` |
| `signedOffByUserId` | FK → User (Teacher) | |
| `notes` | text? | |
| `signedOffAt` | datetime | |

---

## Notes / Open Questions for Stakeholders

- Should `pathwayLevel` (Beginner/Intermediate/Advanced) be per-course-enrollment, or
  per-subject-area (Nazra/Hifz/Tajweed/Tafseer separately)?
- What are the exact criteria for certificate issuance (attendance %, progress
  threshold, teacher sign-off)?
- For one-to-one classes, is booking initiated by the student, or assigned by Super
  Admin/Teacher?
- Video infrastructure choice (see `TECH_SPEC.md`) will determine exact shape of
  `joinUrl`/`roomId` and `Recording.url`.
