import "dotenv/config";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

// All seeded users share this password for local development/testing.
const SEED_PASSWORD_HASH = hashPassword("Password123!");

async function main() {
  // ---------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@quranlearning.org" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@quranlearning.org",
      passwordHash: SEED_PASSWORD_HASH,
      role: "SUPER_ADMIN",
    },
  });

  const tariq = await prisma.user.upsert({
    where: { email: "tariq.mehmood@quranlearning.org" },
    update: {},
    create: {
      name: "Ustadh Tariq Mehmood",
      email: "tariq.mehmood@quranlearning.org",
      passwordHash: SEED_PASSWORD_HASH,
      role: "TEACHER",
      isVolunteer: true,
      verificationStatus: "VERIFIED",
    },
  });

  const khadija = await prisma.user.upsert({
    where: { email: "khadija.noor@quranlearning.org" },
    update: {},
    create: {
      name: "Sister Khadija Noor",
      email: "khadija.noor@quranlearning.org",
      passwordHash: SEED_PASSWORD_HASH,
      role: "TEACHER",
      isVolunteer: true,
      verificationStatus: "VERIFIED",
    },
  });

  const imran = await prisma.user.upsert({
    where: { email: "imran.sheikh@quranlearning.org" },
    update: {},
    create: {
      name: "Ustadh Imran Sheikh",
      email: "imran.sheikh@quranlearning.org",
      passwordHash: SEED_PASSWORD_HASH,
      role: "TEACHER",
      isVolunteer: false,
      verificationStatus: "PENDING",
    },
  });

  const bilalTeacher = await prisma.user.upsert({
    where: { email: "bilal.rahman@quranlearning.org" },
    update: {},
    create: {
      name: "Ustadh Bilal Rahman",
      email: "bilal.rahman@quranlearning.org",
      passwordHash: SEED_PASSWORD_HASH,
      role: "TEACHER",
      isVolunteer: true,
      verificationStatus: "VERIFIED",
    },
  });

  const aisha = await prisma.user.upsert({
    where: { email: "aisha.khan@example.com" },
    update: {},
    create: {
      name: "Aisha Khan",
      email: "aisha.khan@example.com",
      passwordHash: SEED_PASSWORD_HASH,
      role: "PARENT",
    },
  });

  const yusuf = await prisma.user.upsert({
    where: { email: "yusuf.khan@example.com" },
    update: {},
    create: {
      name: "Yusuf Khan",
      email: "yusuf.khan@example.com",
      passwordHash: SEED_PASSWORD_HASH,
      role: "STUDENT",
    },
  });

  const maryamKhan = await prisma.user.upsert({
    where: { email: "maryam.khan@example.com" },
    update: {},
    create: {
      name: "Maryam Khan",
      email: "maryam.khan@example.com",
      passwordHash: SEED_PASSWORD_HASH,
      role: "STUDENT",
    },
  });

  const maryamAli = await prisma.user.upsert({
    where: { email: "maryam.ali@example.com" },
    update: {},
    create: {
      name: "Maryam Ali",
      email: "maryam.ali@example.com",
      passwordHash: SEED_PASSWORD_HASH,
      role: "STUDENT",
    },
  });

  const bilalStudent = await prisma.user.upsert({
    where: { email: "bilal.ahmed@example.com" },
    update: {},
    create: {
      name: "Bilal Ahmed",
      email: "bilal.ahmed@example.com",
      passwordHash: SEED_PASSWORD_HASH,
      role: "STUDENT",
    },
  });

  const sara = await prisma.user.upsert({
    where: { email: "sara.patel@example.com" },
    update: {},
    create: {
      name: "Sara Patel",
      email: "sara.patel@example.com",
      passwordHash: SEED_PASSWORD_HASH,
      role: "STUDENT",
    },
  });

  // ---------------------------------------------------------------------
  // Parent <-> Student links
  // ---------------------------------------------------------------------
  await prisma.parentStudentLink.upsert({
    where: { parentUserId_studentUserId: { parentUserId: aisha.id, studentUserId: yusuf.id } },
    update: {},
    create: { parentUserId: aisha.id, studentUserId: yusuf.id },
  });

  await prisma.parentStudentLink.upsert({
    where: { parentUserId_studentUserId: { parentUserId: aisha.id, studentUserId: maryamKhan.id } },
    update: {},
    create: { parentUserId: aisha.id, studentUserId: maryamKhan.id },
  });

  // ---------------------------------------------------------------------
  // Courses
  // ---------------------------------------------------------------------
  const courseNames = [
    { name: "Nazra Quran", description: "Learn to read the Quran with correct pronunciation." },
    { name: "Tajweed", description: "Master the rules of Quranic recitation." },
    { name: "Hifz-ul-Quran", description: "Memorize the Quran with structured revision." },
    { name: "Tafseer", description: "Understand the meaning and context of Quranic verses." },
    { name: "Salah (Prayer Practice)", description: "Learn the correct method of performing daily prayers." },
    { name: "Islamic Studies", description: "Foundations of Islamic belief, history, and practice." },
  ];

  const courses: Record<string, { id: string }> = {};
  for (const c of courseNames) {
    courses[c.name] = await prisma.course.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  // ---------------------------------------------------------------------
  // Enrollments
  // ---------------------------------------------------------------------
  const enrollments: Array<[typeof yusuf, string, "BEGINNER" | "INTERMEDIATE" | "ADVANCED"]> = [
    [yusuf, "Nazra Quran", "INTERMEDIATE"],
    [yusuf, "Tajweed", "BEGINNER"],
    [yusuf, "Hifz-ul-Quran", "BEGINNER"],
    [maryamKhan, "Nazra Quran", "BEGINNER"],
    [maryamAli, "Tajweed", "BEGINNER"],
    [bilalStudent, "Hifz-ul-Quran", "BEGINNER"],
    [sara, "Nazra Quran", "BEGINNER"],
  ];

  for (const [student, courseName, pathwayLevel] of enrollments) {
    await prisma.enrollment.upsert({
      where: { studentUserId_courseId: { studentUserId: student.id, courseId: courses[courseName].id } },
      update: {},
      create: {
        studentUserId: student.id,
        courseId: courses[courseName].id,
        pathwayLevel,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Teacher availability
  // ---------------------------------------------------------------------
  await prisma.teacherAvailability.createMany({
    data: [
      { teacherUserId: tariq.id, dayOfWeek: 1, startTime: "16:00", endTime: "18:00" },
      { teacherUserId: tariq.id, dayOfWeek: 3, startTime: "16:00", endTime: "18:00" },
      { teacherUserId: khadija.id, dayOfWeek: 2, startTime: "10:00", endTime: "13:00" },
      { teacherUserId: khadija.id, dayOfWeek: 4, startTime: "10:00", endTime: "13:00" },
      { teacherUserId: bilalTeacher.id, dayOfWeek: 5, startTime: "17:00", endTime: "19:00" },
    ],
    skipDuplicates: true,
  });

  // ---------------------------------------------------------------------
  // Class sessions, participants, recording, attendance
  // ---------------------------------------------------------------------
  const now = Date.now();
  const hour = 60 * 60 * 1000;

  const tajweedGroup = await prisma.classSession.create({
    data: {
      courseId: courses["Tajweed"].id,
      teacherUserId: tariq.id,
      type: "GROUP",
      scheduledStart: new Date(now + 2 * 24 * hour),
      scheduledEnd: new Date(now + 2 * 24 * hour + hour),
      status: "SCHEDULED",
    },
  });

  const nazraOneToOne = await prisma.classSession.create({
    data: {
      courseId: courses["Nazra Quran"].id,
      teacherUserId: khadija.id,
      type: "ONE_TO_ONE",
      scheduledStart: new Date(now + 1 * 24 * hour),
      scheduledEnd: new Date(now + 1 * 24 * hour + hour),
      status: "SCHEDULED",
    },
  });

  const hifzRevision = await prisma.classSession.create({
    data: {
      courseId: courses["Hifz-ul-Quran"].id,
      teacherUserId: bilalTeacher.id,
      type: "GROUP",
      scheduledStart: new Date(now + 3 * 24 * hour),
      scheduledEnd: new Date(now + 3 * 24 * hour + hour),
      status: "SCHEDULED",
    },
  });

  const completedTajweedSession = await prisma.classSession.create({
    data: {
      courseId: courses["Tajweed"].id,
      teacherUserId: tariq.id,
      type: "GROUP",
      scheduledStart: new Date(now - 5 * 24 * hour),
      scheduledEnd: new Date(now - 5 * 24 * hour + hour),
      status: "COMPLETED",
    },
  });

  await prisma.classParticipant.createMany({
    data: [
      { classSessionId: tajweedGroup.id, studentUserId: yusuf.id },
      { classSessionId: tajweedGroup.id, studentUserId: maryamAli.id },
      { classSessionId: nazraOneToOne.id, studentUserId: yusuf.id },
      { classSessionId: hifzRevision.id, studentUserId: yusuf.id },
      { classSessionId: hifzRevision.id, studentUserId: bilalStudent.id },
      { classSessionId: completedTajweedSession.id, studentUserId: yusuf.id },
      { classSessionId: completedTajweedSession.id, studentUserId: maryamAli.id },
    ],
    skipDuplicates: true,
  });

  await prisma.recording.create({
    data: {
      classSessionId: completedTajweedSession.id,
      url: "https://recordings.example.com/tajweed-group-2026-06-08.mp4",
      durationSeconds: 3600,
    },
  });

  await prisma.attendance.createMany({
    data: [
      {
        classSessionId: completedTajweedSession.id,
        studentUserId: yusuf.id,
        status: "PRESENT",
        markedByUserId: tariq.id,
      },
      {
        classSessionId: completedTajweedSession.id,
        studentUserId: maryamAli.id,
        status: "LATE",
        markedByUserId: tariq.id,
      },
    ],
    skipDuplicates: true,
  });

  // ---------------------------------------------------------------------
  // Assignments & submissions
  // ---------------------------------------------------------------------
  const dueSoon = new Date(now + 4 * 24 * hour);

  const fatihaAssignment = await prisma.assignment.create({
    data: {
      courseId: courses["Nazra Quran"].id,
      classSessionId: nazraOneToOne.id,
      teacherUserId: khadija.id,
      title: "Surah Al-Fatiha Recitation",
      description: "Record yourself reciting Surah Al-Fatiha with correct pronunciation.",
      dueDate: dueSoon,
    },
  });

  const ghunnahAssignment = await prisma.assignment.create({
    data: {
      courseId: courses["Tajweed"].id,
      classSessionId: tajweedGroup.id,
      teacherUserId: tariq.id,
      title: "Ghunnah Practice Worksheet",
      description: "Complete the worksheet identifying Ghunnah letters in the given verses.",
      dueDate: dueSoon,
    },
  });

  const baqarahAssignment = await prisma.assignment.create({
    data: {
      courseId: courses["Hifz-ul-Quran"].id,
      classSessionId: hifzRevision.id,
      teacherUserId: bilalTeacher.id,
      title: "Memorize Ayah 1–5, Al-Baqarah",
      description: "Memorize and be ready to recite the first five ayahs of Al-Baqarah.",
      dueDate: dueSoon,
    },
  });

  await prisma.submission.upsert({
    where: { assignmentId_studentUserId: { assignmentId: fatihaAssignment.id, studentUserId: yusuf.id } },
    update: {},
    create: {
      assignmentId: fatihaAssignment.id,
      studentUserId: yusuf.id,
      contentType: "AUDIO",
      content: "https://submissions.example.com/yusuf-fatiha.mp3",
      status: "REVIEWED",
      grade: "A",
      feedback: "Excellent recitation, work on the Madd in verse 4.",
      submittedAt: new Date(now - 2 * 24 * hour),
      reviewedAt: new Date(now - 1 * 24 * hour),
    },
  });

  await prisma.submission.upsert({
    where: { assignmentId_studentUserId: { assignmentId: ghunnahAssignment.id, studentUserId: yusuf.id } },
    update: {},
    create: {
      assignmentId: ghunnahAssignment.id,
      studentUserId: yusuf.id,
      contentType: "FILE",
      content: "https://submissions.example.com/yusuf-ghunnah.pdf",
      status: "SUBMITTED",
      submittedAt: new Date(now - 1 * 24 * hour),
    },
  });

  await prisma.submission.upsert({
    where: { assignmentId_studentUserId: { assignmentId: baqarahAssignment.id, studentUserId: yusuf.id } },
    update: {},
    create: {
      assignmentId: baqarahAssignment.id,
      studentUserId: yusuf.id,
      contentType: "TEXT",
      status: "NOT_SUBMITTED",
    },
  });

  // ---------------------------------------------------------------------
  // Progress entries
  // ---------------------------------------------------------------------
  await prisma.progressEntry.createMany({
    data: [
      {
        studentUserId: yusuf.id,
        courseId: courses["Nazra Quran"].id,
        subjectArea: "NAZRA",
        description: "Reading fluency across Juz 1-2",
        level: "Intermediate",
        percentComplete: 70,
        recordedByUserId: khadija.id,
      },
      {
        studentUserId: yusuf.id,
        courseId: courses["Tajweed"].id,
        subjectArea: "TAJWEED",
        description: "Ghunnah and Qalqalah rules",
        level: "Beginner",
        percentComplete: 45,
        recordedByUserId: tariq.id,
      },
      {
        studentUserId: yusuf.id,
        courseId: courses["Hifz-ul-Quran"].id,
        subjectArea: "HIFZ",
        description: "Memorization of Surah Al-Fatiha and Al-Baqarah 1-5",
        level: "Beginner",
        percentComplete: 20,
        recordedByUserId: bilalTeacher.id,
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------
  await prisma.notification.createMany({
    data: [
      {
        userId: yusuf.id,
        type: "CLASS_REMINDER",
        message: "Your Nazra Quran one-to-one class starts tomorrow at the scheduled time.",
      },
      {
        userId: yusuf.id,
        type: "HOMEWORK_GRADED",
        message: "Your Surah Al-Fatiha Recitation submission has been graded: A",
      },
      {
        userId: yusuf.id,
        type: "HOMEWORK_ASSIGNED",
        message: "New assignment: Memorize Ayah 1–5, Al-Baqarah",
      },
      {
        userId: aisha.id,
        type: "ATTENDANCE_RECORDED",
        message: "Yusuf Khan was marked present for Tajweed — Group Class.",
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Resources
  // ---------------------------------------------------------------------
  await prisma.resource.createMany({
    data: [
      {
        courseId: courses["Nazra Quran"].id,
        type: "PDF",
        title: "Arabic Alphabet Chart",
        url: "https://resources.example.com/arabic-alphabet-chart.pdf",
        uploadedByUserId: khadija.id,
      },
      {
        courseId: courses["Nazra Quran"].id,
        type: "PDF",
        title: "Letter Tracing Worksheet",
        url: "https://resources.example.com/letter-tracing-worksheet.pdf",
        uploadedByUserId: khadija.id,
      },
      {
        courseId: courses["Nazra Quran"].id,
        type: "AUDIO",
        title: "Surah Al-Fatiha Recitation Audio",
        url: "https://resources.example.com/al-fatiha-recitation.mp3",
        uploadedByUserId: khadija.id,
      },
      {
        courseId: courses["Tajweed"].id,
        type: "PDF",
        title: "Tajweed Rules Summary",
        url: "https://resources.example.com/tajweed-rules-summary.pdf",
        uploadedByUserId: tariq.id,
      },
      {
        courseId: courses["Tajweed"].id,
        type: "PDF",
        title: "Makharij (Articulation Points) Guide",
        url: "https://resources.example.com/makharij-guide.pdf",
        uploadedByUserId: tariq.id,
      },
      {
        courseId: courses["Tajweed"].id,
        type: "AUDIO",
        title: "Ghunnah Practice Audio",
        url: "https://resources.example.com/ghunnah-practice.mp3",
        uploadedByUserId: tariq.id,
      },
      {
        courseId: courses["Tajweed"].id,
        type: "VIDEO",
        title: "Noon & Meem Rules — Explainer",
        url: "https://resources.example.com/noon-meem-rules.mp4",
        uploadedByUserId: tariq.id,
      },
      {
        courseId: courses["Hifz-ul-Quran"].id,
        type: "PDF",
        title: "Al-Baqarah 1–20 Memorization Guide",
        url: "https://resources.example.com/al-baqarah-1-20-guide.pdf",
        uploadedByUserId: bilalTeacher.id,
      },
      {
        courseId: courses["Hifz-ul-Quran"].id,
        type: "AUDIO",
        title: "Surah Al-Fatiha Recitation (Slow)",
        url: "https://resources.example.com/al-fatiha-slow.mp3",
        uploadedByUserId: bilalTeacher.id,
      },
      {
        courseId: null,
        type: "PDF",
        title: "Daily Dua Booklet",
        url: "https://resources.example.com/daily-dua-booklet.pdf",
        uploadedByUserId: admin.id,
      },
      {
        courseId: null,
        type: "PDF",
        title: "Islamic Calendar 2026",
        url: "https://resources.example.com/islamic-calendar-2026.pdf",
        uploadedByUserId: admin.id,
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Forum posts & replies
  // ---------------------------------------------------------------------
  const welcomePost = await prisma.forumPost.create({
    data: {
      authorUserId: admin.id,
      title: "Welcome to the new community forum!",
      body: "Assalamu alaikum everyone — use this space to ask questions, share progress, and support each other.",
    },
  });

  await prisma.forumReply.create({
    data: {
      postId: welcomePost.id,
      authorUserId: khadija.id,
      body: "Wa alaikum assalam! Looking forward to seeing everyone's progress here.",
    },
  });

  const ghunnahPost = await prisma.forumPost.create({
    data: {
      courseId: courses["Tajweed"].id,
      authorUserId: yusuf.id,
      title: "Tips for mastering the Ghunnah sound",
      body: "Does anyone have tips for getting the nasal sound right for Ghunnah letters?",
    },
  });

  await prisma.forumReply.create({
    data: {
      postId: ghunnahPost.id,
      authorUserId: tariq.id,
      body: "Practice holding the sound for two counts while pinching your nose lightly to feel the vibration.",
    },
  });

  await prisma.forumPost.create({
    data: {
      authorUserId: aisha.id,
      title: "Best time to start Hifz for young children?",
      body: "My younger child is 5 — is it too early to start memorization, or should we wait?",
    },
  });

  // ---------------------------------------------------------------------
  // Certificates & teacher badges
  // ---------------------------------------------------------------------
  await prisma.certificate.create({
    data: {
      studentUserId: yusuf.id,
      courseId: courses["Nazra Quran"].id,
      pathwayLevel: "BEGINNER",
      certificateUrl: "https://certificates.example.com/yusuf-nazra-beginner.pdf",
    },
  });

  await prisma.teacherBadge.create({
    data: {
      teacherUserId: khadija.id,
      badgeName: "Top Rated Teacher",
      awardedByUserId: admin.id,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
