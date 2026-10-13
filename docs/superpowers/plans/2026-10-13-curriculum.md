# Quranic Curriculum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Model the 22-level / ~85-module curriculum in the app, seed it from the curriculum document, let admins manage it, let teachers sign off modules, and show students their gated path.

**Architecture:** Add a `CurriculumLevel` layer between `Course` and `CourseModule`. Each level belongs to a track Course, and each module gains a code ("1.1") plus four structured lists: subjects, mandatory learning, practice and assessment. Progression is gated by a new `ModuleSignOff` record that a teacher creates. A pure function decides locked/unlocked/completed state. The curriculum text lives in a typed TS data file, and an idempotent seed script upserts it, so admins only add lesson content (`ModuleContent`) on top.

**Tech Stack:** Next.js 16 App Router (read `node_modules/next/dist/docs/` before writing Next code), Prisma 7 + MySQL (MariaDB adapter), next-intl, shadcn/ui, Vitest (new, for pure logic only).

**Spec:** `docs/Quran App Curriclum.docx` (extracted text: run the python snippet in Task 2 Step 1)

## Global Constraints

- Every module has four sections: **What You Learn**, **Mandatory Learning**, **Practice**, **Assessment** (UI labels use exactly these words).
- Stage progression copy: `Foundation → Practice → Understanding → Mastery`.
- A student must not access module N+1 of a level path until module N is signed off, if module N is gated (`isGated`). Gated is the default.
- Completing a course or level must **never** be described as an "Ijazah" in UI, certificates or seed text. Level 22's title stays "Quran Teacher & Ijazah Preparation" and its description must carry the doc's disclaimer verbatim: "An Ijazah should only be represented as an actual Ijazah where it is granted by an appropriately qualified scholar/teacher according to the relevant tradition; completing an app course alone should not automatically be described as Ijazah."
- Fiqh (Level 12) displays a `methodologyNote` on the level. The seed value is the doc sentence: "Where recognized schools differ, the app should clearly identify the school/methodology used and explain important differences rather than confusing students." Admins replace it with the actual madhhab used.
- Duas (Level 16) keep the doc's sourcing requirement as the level `methodologyNote`.
- Level 19 is marked `minAge: 16`.
- Doc errata, applied in the data file: Module 7.1 title → "Early Ajza"; Module 15.4 is a module, not body text; the doc intro lists 10 levels, but the body (22 levels) is authoritative.
- Existing courses and modules created by admins keep working. `CourseModule.levelId` is nullable, and legacy modules are never gated.
- UI strings go in `messages/en.json`. Copy the same English keys into `ur.json` and `ar.json` (translation is out of scope).
- Use theme tokens and `font-heading` / `font-sans` per `CLAUDE.md`. Don't hardcode colours.

### Track → Course mapping (seeded via `upsert` on `Course.name`)

| Course name | Levels |
|---|---|
| Quran Reading | 1–3 |
| Tajweed | 4–5 |
| Hifz-ul-Quran | 6–7 |
| Quran Understanding | 8–10 |
| Islamic Studies | 11–18 |
| Advanced Quranic Studies | 19–21 |
| Quran Teacher Preparation | 22 |

## Review Focus

1. **Seed re-run against a DB where admins already edited a module.** Re-seeding must not overwrite admin edits to the four lists. The seed only creates missing levels/modules (match on `code`) and never updates existing rows. Test: Task 3, `seed plan skips existing codes`.
2. **Student enrolled in a track whose first module isn't gated, or whose level has zero modules.** Must not crash or lock everything. Test: Task 2, `empty path returns empty map` and `ungated module never blocks next`.
3. **Teacher signs off a module for a student not enrolled in that course, or in a course they don't teach.** Must be rejected. Test: Task 5, `canSignOff rejects foreign course`.
4. **Sign-off revoked after later modules were completed.** Later modules become locked again, but their `ModuleProgress` stays. Test: Task 2, `revoked earlier signoff relocks later modules`.
5. **Module with legacy null `levelId` shown alongside curriculum modules on /student/learn.** It must appear unlocked in an "Other modules" group. Test: Task 2, `legacy modules are always unlocked`.

---

### Task 1: Schema — levels, structured module fields, sign-offs

**Files:**
- Modify: `prisma/schema.prisma` (models `Course`, `CourseModule`, `User`; add `CurriculumLevel`, `ModuleSignOff`)
- Create: `prisma/migrations/<timestamp>_add_curriculum_levels/migration.sql` (generated)

**Interfaces:**
- Produces:
  - `model CurriculumLevel { id String @id @default(uuid()) @db.VarChar(36); number Int @unique; title String; subtitle String?; purpose String? @db.Text; methodologyNote String? @db.Text; minAge Int?; courseId String @db.VarChar(36); course Course @relation(...onDelete: Cascade); modules CourseModule[]; @@map("curriculum_levels") }`
  - `CourseModule` adds: `levelId String? @db.VarChar(36)`, `level CurriculumLevel? @relation(..., onDelete: SetNull)`, `code String? @unique` (e.g. "1.1"), `subjects Json?`, `mandatoryLearning Json?`, `practice Json?`, `assessment Json?` (each a `string[]`), `isGated Boolean @default(true)`, `signOffs ModuleSignOff[]`.
  - `model ModuleSignOff { id; studentUserId; moduleId; signedOffByUserId; notes String? @db.Text; signedOffAt DateTime @default(now()); @@unique([studentUserId, moduleId]); @@map("module_sign_offs") }`, with relations to `User` (named `"StudentSignOffs"` / `"TeacherSignOffs"`) and `CourseModule` (Cascade).
  - `Course` adds `levels CurriculumLevel[]`.

- [ ] **Step 1:** Edit the schema as above.
- [ ] **Step 2:** Run `npx prisma migrate dev --name add_curriculum_levels --create-only`. Expected: a new folder whose SQL has `CREATE TABLE curriculum_levels`, `module_sign_offs`, and `ALTER TABLE course_modules ADD COLUMN levelId ... code ...`. Check it has no `DROP` statements. (Needs a reachable DB. If Aiven is still powered off, start it first.)
- [ ] **Step 3:** Run `npx prisma migrate dev` then `npx prisma generate`. Expected: "Your database is now in sync" and TypeScript `npx tsc --noEmit` passes.
- [ ] **Step 4:** Commit: `git commit -m "feat(curriculum): add levels, structured module fields and sign-offs"`.

### Task 2: Vitest + pure access logic

**Files:**
- Modify: `package.json` (devDependency `vitest`; script `"test": "vitest run"`)
- Create: `vitest.config.ts` (resolve alias `@` → project root, `environment: "node"`)
- Create: `lib/curriculum/access.ts`
- Test: `lib/curriculum/access.test.ts`

**Interfaces:**
- Produces:
  - `export type ModuleState = "completed" | "unlocked" | "locked";`
  - `export type AccessModule = { id: string; levelNumber: number | null; moduleOrder: number; isGated: boolean };`
  - `export function computeModuleAccess(modules: AccessModule[], signedOffIds: ReadonlySet<string>): Map<string, ModuleState>`. Rules: sort curriculum modules by `(levelNumber, moduleOrder)` within the input (callers pass one course's modules). The first module is unlocked. A signed-off module is `completed`. A module is unlocked iff every earlier *gated* module is signed off. Modules with `levelNumber === null` are always `unlocked` (or `completed` if signed off).

- [ ] **Step 1:** `npm i -D vitest`, then add the config and script.
- [ ] **Step 2: Write failing tests** in `access.test.ts`:
  - `first module unlocked, rest locked when nothing signed off` → states `[unlocked, locked, locked]` for three gated modules in level 1.
  - `signing off module 1 unlocks module 2 only` → `[completed, unlocked, locked]`.
  - `ungated module never blocks next` → modules A (gated=false), B; no sign-offs → `[unlocked, unlocked]`.
  - `ordering crosses levels` → level 2 order 0 is locked until every gated level-1 module is signed off, regardless of input array order.
  - `revoked earlier signoff relocks later modules` → signed = {m3} only → `[unlocked, locked, completed]`. A signed-off module stays `completed` even if an earlier one is not.
  - `legacy modules are always unlocked` → `{levelNumber: null}` → `unlocked`.
  - `empty path returns empty map` → `computeModuleAccess([], new Set()).size === 0`.
- [ ] **Step 3:** Run `npx vitest run lib/curriculum/access.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 4:** Implement `computeModuleAccess`.
- [ ] **Step 5:** Re-run. Expected: 7 passed.
- [ ] **Step 6:** Commit: `feat(curriculum): module access gating logic with vitest`.

### Task 3: Curriculum data file + idempotent seed

**Files:**
- Create: `lib/curriculum/data.ts`
- Create: `lib/curriculum/seed-plan.ts`
- Test: `lib/curriculum/seed-plan.test.ts`, `lib/curriculum/data.test.ts`
- Create: `prisma/seed-curriculum.ts`
- Modify: `package.json` (script `"db:seed:curriculum": "tsx prisma/seed-curriculum.ts"`)

**Interfaces:**
- Produces:
  - `export type CurriculumModuleData = { code: string; title: string; subjects: string[]; mandatoryLearning: string[]; practice: string[]; assessment: string[] };`
  - `export type CurriculumLevelData = { number: number; title: string; subtitle?: string; purpose?: string; methodologyNote?: string; minAge?: number; courseName: string; modules: CurriculumModuleData[] };`
  - `export const CURRICULUM: CurriculumLevelData[]` (22 entries)
  - `export const STAGES = ["Foundation", "Practice", "Understanding", "Mastery"] as const;`
  - `export function planSeed(data: CurriculumLevelData[], existingLevelNumbers: Set<number>, existingModuleCodes: Set<string>): { levelsToCreate: CurriculumLevelData[]; modulesToCreate: { levelNumber: number; moduleOrder: number; module: CurriculumModuleData }[] }`

- [ ] **Step 1:** Extract the doc text: `PYTHONIOENCODING=utf-8 python -c "import zipfile,re;x=zipfile.ZipFile('docs/Quran App Curriclum.docx').read('word/document.xml').decode();print('\n'.join(''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>',p)) for p in re.findall(r'<w:p[ >].*?</w:p>',x,re.S)))"`
- [ ] **Step 2: Write failing tests:**
  - `data.test.ts`:
    - `has 22 levels numbered 1..22`.
    - `every module code matches "<level>.<n>" and is unique`.
    - `module 7.1 is titled "Early Ajza"`.
    - `level 19 minAge is 16`.
    - `level 22 purpose contains the Ijazah disclaimer` (exact sentence from Global Constraints).
    - `level 12 methodologyNote is set`.
    - `every courseName is one of the 7 track names` (exact names from the mapping table).
    - `no module title or level title other than level 22 contains "Ijazah"`.
  - `seed-plan.test.ts`:
    - `creates everything on empty db` (levels 22, modules = total module count).
    - `seed plan skips existing codes` (existing {"1.1"} → "1.1" not in modulesToCreate, "1.2" is).
    - `moduleOrder is index within level`.
- [ ] **Step 3:** Run `npx vitest run lib/curriculum`. Expected: FAIL.
- [ ] **Step 4:** Transcribe all 22 levels into `data.ts`, copying list items verbatim from the extracted text. Where the doc omits a section, use `[]`; don't invent content. Apply the errata from Global Constraints.
- [ ] **Step 5:** Implement `planSeed`.
- [ ] **Step 6:** Implement `prisma/seed-curriculum.ts`:
  - Upsert the 7 Courses by `name` (create-only fields).
  - Read existing level numbers and module codes.
  - Call `planSeed`.
  - Create the planned rows with `isFree: true, isGated: true`.
  - Print counts.
  - It must never `update` existing modules.
- [ ] **Step 7:** Run `npx vitest run` (expected: all pass). Then run `npm run db:seed:curriculum` twice. Expected: the first run prints `levels created: 22`, and the second prints `levels created: 0, modules created: 0`.
- [ ] **Step 8:** Commit: `feat(curriculum): seed 22-level curriculum from document`.

### Task 4: Admin — Curriculum page and module editor

**Files:**
- Create: `app/admin/curriculum/page.tsx`, `app/admin/curriculum/loading.tsx`, `app/admin/curriculum/actions.ts`, `app/admin/curriculum/module-editor.tsx` (client)
- Create: `lib/curriculum/lines.ts`, Test: `lib/curriculum/lines.test.ts`
- Modify: `components/dashboard/nav-config.tsx` (admin: add `{ href: "/admin/curriculum", labelKey: "curriculum", icon: ListTree }` after courses, and `{ href: "/admin/modules", labelKey: "modules", icon: Layers }`)
- Modify: `messages/{en,ur,ar}.json` (`nav.admin.curriculum`, `nav.admin.modules`, `pages.admin.curriculum.*`)

**Interfaces:**
- Consumes: Task 1 models, `CURRICULUM` and `STAGES` from Task 3.
- Produces:
  - `export function parseLines(text: string): string[]` (split on newlines, trim, drop empties)
  - `export function toLines(list: unknown): string` (JSON `string[]` → newline text; non-arrays → `""`)
  - Server action `updateModuleCurriculum(moduleId: string, formData: FormData): Promise<{ error?: string }>`, which reads `subjects`, `mandatoryLearning`, `practice`, `assessment` (textareas, one item per line) and `isGated`, requires `SUPER_ADMIN`, and revalidates `/admin/curriculum` and `/student/learn`.
  - Server action `updateLevelNotes(levelId: string, formData: FormData)` for `purpose` and `methodologyNote`.

- [ ] **Step 1:** Write failing tests in `lines.test.ts`:
  - `parseLines("a\n\n b \r\nc") → ["a","b","c"]`.
  - `toLines(["a","b"]) → "a\nb"`.
  - `toLines(null) → ""`.
- [ ] **Step 2:** Run the tests (FAIL), implement, then run again (PASS).
- [ ] **Step 3:** Build the page. Levels are grouped by course and ordered by `number`. Each level is a collapsible card showing purpose and methodology note. Each module row shows its code, title, gated badge and content count, plus a "Manage lessons" link to `/admin/modules#<moduleId>`. An expandable `ModuleEditor` holds four textareas plus a gated checkbox. Use one `Promise.all` for data (match the pattern in `app/admin/page.tsx`).
- [ ] **Step 4:** Add an `id={module.id}` anchor on each module card in `app/admin/modules/page.tsx` so the link scrolls to it.
- [ ] **Step 5:** Verify:
  - `npx tsc --noEmit` and `npx eslint app/admin/curriculum` are clean.
  - Manually, in dev, `/admin/curriculum` lists 22 levels.
  - Editing 1.1 "Practice" and reloading persists the change.
  - "Manage lessons" scrolls to the module.
- [ ] **Step 6:** Commit: `feat(curriculum): admin curriculum management page`.

### Task 5: Teacher — sign off modules

**Files:**
- Create: `lib/curriculum/signoff.ts`, Test: `lib/curriculum/signoff.test.ts`
- Create: `app/teacher/curriculum/page.tsx`, `app/teacher/curriculum/loading.tsx`, `app/teacher/curriculum/actions.ts`, `app/teacher/curriculum/signoff-button.tsx` (client)
- Modify: `components/dashboard/nav-config.tsx` (teacher: `{ href: "/teacher/curriculum", labelKey: "curriculum", icon: ListChecks }`), plus the messages files

**Interfaces:**
- Consumes: `teacherCoursesWhere(teacherUserId)` from `lib/teacher.ts`; `computeModuleAccess` from Task 2.
- Produces:
  - `export function canSignOff(args: { teacherCourseIds: string[]; studentCourseIds: string[]; moduleCourseId: string }): boolean` → true iff the module's course is in both lists.
  - Server actions:
    - `signOffModule(studentUserId: string, moduleId: string, notes?: string): Promise<{ error?: string }>`. It requires `TEACHER`, loads the teacher's course ids, the student's ACTIVE enrollment course ids and the module's course, checks `canSignOff`, then upserts `ModuleSignOff` on `(studentUserId, moduleId)`.
    - `revokeSignOff(studentUserId: string, moduleId: string)` deletes the record, with the same authorisation.
  - Both revalidate `/teacher/curriculum` and `/student/learn`.

- [ ] **Step 1:** Write failing tests:
  - `canSignOff allows shared course`.
  - `canSignOff rejects foreign course` (teacher doesn't teach it).
  - `canSignOff rejects unenrolled student`.
- [ ] **Step 2:** Run the tests (FAIL), implement, then run again (PASS).
- [ ] **Step 3:** Build the page.
  - `?student=<id>` uses a select of students actively enrolled in the teacher's courses (one query using `teacherCoursesWhere`).
  - For the chosen student, list the curriculum modules of their enrolled courses with state from `computeModuleAccess`.
  - Each module shows its Mandatory Learning and Assessment items as a checklist for the teacher.
  - "Sign off" (with optional notes) appears on `unlocked` modules; "Revoke" appears on `completed` ones.
- [ ] **Step 4:** Verify in dev:
  - Sign off 1.1 for a test student, and 1.2 becomes unlocked.
  - Revoke 1.1, and 1.2 locks again.
  - `tsc` and `eslint` are clean.
- [ ] **Step 5:** Commit: `feat(curriculum): teacher module sign-off`.

### Task 6: Student — gated learning path on /student/learn

**Files:**
- Modify: `app/student/learn/page.tsx`
- Create: `components/curriculum/module-sections.tsx` (server component that renders the four sections), plus the messages files

**Interfaces:**
- Consumes: `computeModuleAccess`, `STAGES`, `toLines` (not needed; read JSON arrays directly), Task 1 fields.

- [ ] **Step 1:** Extend the existing `Promise.all`:
  - Add `level: { select: { number, title, purpose, methodologyNote, minAge } }` and the four list fields to the modules query.
  - Add a query for `prisma.moduleSignOff.findMany({ where: { studentUserId: user.id }, select: { moduleId: true } })`.
- [ ] **Step 2:** Group modules as course → level → module, plus an "Other modules" group for `levelId = null`. Compute state per course with `computeModuleAccess`.
- [ ] **Step 3:** Render the modules.
  - Locked modules show the title and the "What You Learn" list only, with a lock icon and "Complete the previous module with your teacher to unlock". Their lesson content isn't rendered.
  - Unlocked and completed modules show all four sections (headings exactly "What You Learn", "Mandatory Learning", "Practice", "Assessment") and the existing content list.
  - The level header shows the purpose, the `methodologyNote` callout when present, and a "16+" badge when `minAge`.
  - Sections with empty lists are hidden.
- [ ] **Step 4:** Verify:
  - In dev, a new student sees 1.1 unlocked and 1.2 locked. After a teacher sign-off (Task 5), 1.2 unlocks.
  - Legacy modules still display.
  - `npx next build` passes.
- [ ] **Step 5:** Commit: `feat(curriculum): gated curriculum view for students`.

### Task 7: Docs

**Files:**
- Modify: `docs/DATA_MODEL.md` (CurriculumLevel, ModuleSignOff, new CourseModule fields), `docs/FEATURES.md` (curriculum and sign-off acceptance criteria)

- [ ] **Step 1:** Document the models, the track mapping table, gating rules and the Ijazah/Fiqh constraints.
- [ ] **Step 2:** Commit: `docs: curriculum data model and features`.

## Open questions for the product owner (do not block Tasks 1–3)

1. Which madhhab/methodology should Level 12 name? The seed uses the doc's generic note until an admin edits it.
2. Should certificates (`PathwayLevel` BEGINNER/INTERMEDIATE/ADVANCED) map to levels? This plan leaves certificates unchanged.
3. Should Level 19's 16+ be enforced (block enrollment) or only displayed? This plan only displays it.
