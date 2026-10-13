// Transcribed from docs/Quran App Curriclum.docx. Where the document omits a
// section for a module the list is empty — content is not invented here.
// Errata applied: Module 7.1 "Early Words" → "Early Ajza"; Module 15.4 was
// formatted as body text in the document but is a module. Mandatory-learning
// notes the document places after a level's last module are attached to it.

export const STAGES = ["Foundation", "Practice", "Understanding", "Mastery"] as const;

export const TRACK_COURSES = [
  "Quran Reading",
  "Tajweed",
  "Hifz-ul-Quran",
  "Quran Understanding",
  "Islamic Studies",
  "Advanced Quranic Studies",
  "Quran Teacher Preparation",
] as const;

export type TrackCourse = (typeof TRACK_COURSES)[number];

export type CurriculumModuleData = {
  code: string;
  title: string;
  subjects: string[];
  mandatoryLearning: string[];
  practice: string[];
  assessment: string[];
};

export type CurriculumLevelData = {
  number: number;
  title: string;
  subtitle?: string;
  purpose?: string;
  methodologyNote?: string;
  minAge?: number;
  courseName: TrackCourse;
  modules: CurriculumModuleData[];
};

function mod(
  code: string,
  title: string,
  sections: Partial<Omit<CurriculumModuleData, "code" | "title">>
): CurriculumModuleData {
  return {
    code,
    title,
    subjects: sections.subjects ?? [],
    mandatoryLearning: sections.mandatoryLearning ?? [],
    practice: sections.practice ?? [],
    assessment: sections.assessment ?? [],
  };
}

export const CURRICULUM: CurriculumLevelData[] = [
  {
    number: 1,
    title: "Islamic & Arabic Foundation",
    subtitle: "Absolute Beginner",
    purpose: "Give beginners the basic Arabic and Islamic knowledge needed to begin Quran learning.",
    courseName: "Quran Reading",
    modules: [
      mod("1.1", "Arabic Alphabet & Letter Recognition", {
        subjects: [
          "Introduction to Arabic language and its importance in Quran reading",
          "29 Arabic letters",
          "Names and sounds of letters",
          "Different shapes of letters",
          "Beginning, middle and ending forms",
          "Letters that connect and do not connect",
          "Similar-looking letters",
          "Recognition of letters in isolation and within words",
          "Basic pronunciation of each letter",
        ],
        mandatoryLearning: [
          "Recognize every Arabic letter",
          "Say the correct name of each letter",
          "Distinguish similar letters",
          "Identify letters regardless of their position",
          "Understand basic Arabic letter joining",
        ],
        practice: [
          "Letter recognition",
          "Audio repetition",
          "Flashcards",
          "Matching exercises",
          "Pronunciation exercises",
        ],
      }),
      mod("1.2", "Arabic Harakat & Basic Sounds", {
        subjects: [
          "Fathah",
          "Kasrah",
          "Dammah",
          "Sukoon",
          "Tanween",
          "Shaddah",
          "Madd",
          "Hamzah",
          "Basic vowel combinations",
        ],
        practice: [
          "Listen and repeat",
          "Read individual combinations",
          "Identify vowel signs",
          "Audio pronunciation exercises",
        ],
      }),
      mod("1.3", "My First Islamic Knowledge", {
        subjects: [
          "Meaning of Islam",
          "Meaning of Iman",
          "Who is Allah?",
          "Who is Prophet Muhammad ﷺ?",
          "Shahadah",
          "Five Pillars of Islam",
          "Six Articles of Faith",
          "Quran as the Book of Allah",
          "Importance of Salah",
          "Basic Islamic identity and manners",
        ],
        mandatoryLearning: [
          "Five Pillars of Islam",
          "Six Articles of Faith",
          "Shahadah",
          "Basic meaning of Tawheed",
          "Identity and role of Prophet Muhammad ﷺ",
          "Basic purpose of Quran",
        ],
      }),
      mod("1.4", "Muslim Daily Life", {
        subjects: [
          "Cleanliness",
          "Wudu introduction",
          "Salah introduction",
          "Masjid etiquette",
          "Greeting Muslims",
          "Eating manners",
          "Sleeping manners",
          "Respect for parents",
          "Respect for teachers",
          "Basic daily duas",
        ],
        mandatoryLearning: [
          "Basic Wudu sequence",
          "Basic Salah awareness",
          "Islamic greeting",
          "Essential daily manners",
          "Selected daily duas",
        ],
      }),
    ],
  },
  {
    number: 2,
    title: "Noorani Qaida & Quran Reading Foundation",
    subtitle: "Qaida & Beginning Nazra",
    purpose: "Move from recognizing Arabic to actually reading Quranic words.",
    courseName: "Quran Reading",
    modules: [
      mod("2.1", "Joining Arabic Letters", {
        subjects: [
          "Two-letter combinations",
          "Three-letter combinations",
          "Four-letter combinations",
          "Connected forms",
          "Word formation",
          "Reading from right to left",
          "Recognizing letters inside words",
        ],
        mandatoryLearning: [
          "Read basic connected Arabic combinations without identifying every letter separately.",
        ],
      }),
      mod("2.2", "Harakat in Quranic Reading", {
        subjects: [
          "Fathah",
          "Kasrah",
          "Dammah",
          "Sukoon",
          "Tanween",
          "Shaddah",
          "Madd",
          "Hamzah",
          "Combined signs",
        ],
        mandatoryLearning: [
          "Correctly pronounce and distinguish all basic vowel and pronunciation signs.",
        ],
      }),
      mod("2.3", "Quranic Word Reading", {
        subjects: [
          "Common Quranic words",
          "Longer words",
          "Difficult combinations",
          "Repeated Quranic patterns",
          "Words containing Shaddah",
          "Words containing Madd",
          "Words containing Sukoon",
          "Words containing Tanween",
        ],
        mandatoryLearning: ["Read unfamiliar basic Quranic words with reasonable accuracy."],
      }),
      mod("2.4", "Qaida Completion & Assessment", {
        subjects: [
          "Full Qaida revision",
          "Mixed exercises",
          "Difficult words",
          "Reading speed",
          "Pronunciation correction",
          "Introduction to Quranic stopping",
        ],
        mandatoryLearning: [
          "Before entering Nazra, the student must demonstrate: Letter recognition + Harakat + Word reading + Basic pronunciation.",
        ],
      }),
    ],
  },
  {
    number: 3,
    title: "Nazra Quran",
    subtitle: "Complete Quran Reading",
    purpose: "Develop fluent Quran reading from the Mushaf.",
    courseName: "Quran Reading",
    modules: [
      mod("3.1", "Beginning Nazra", {
        subjects: [
          "Quran page structure",
          "Surah and Ayah identification",
          "Basmalah",
          "Reading short passages",
          "Connecting words",
          "Correct vowel pronunciation",
          "Basic stopping",
        ],
        mandatoryLearning: ["Read short Quranic passages independently."],
      }),
      mod("3.2", "Progressive Quran Reading", {
        subjects: [
          "Juz Amma",
          "Short Surahs",
          "Longer verses",
          "Difficult words",
          "Similar words",
          "Reading without excessive hesitation",
          "Continuous reading",
        ],
        mandatoryLearning: ["Maintain reasonable accuracy while reading longer passages."],
      }),
      mod("3.3", "Complete Quran Reading", {
        subjects: [
          "Para 1–10",
          "Para 11–20",
          "Para 21–30",
          "Difficult passages",
          "Revision",
          "Reading consistency",
        ],
        mandatoryLearning: [
          "Progressively complete the entire Quran with teacher/audio correction.",
        ],
      }),
      mod("3.4", "Nazra Fluency Assessment", {
        mandatoryLearning: [
          "Correct basic pronunciation",
          "Consistent reading",
          "Reduced hesitation",
          "Recognition of Quranic symbols",
          "Ability to continue reading independently",
        ],
        assessment: ["Nazra fluency assessment"],
      }),
    ],
  },
  {
    number: 4,
    title: "Tajweed Foundation",
    subtitle: "Correct Quranic Pronunciation",
    purpose: "Teach the fundamental rules necessary for correct Quranic recitation.",
    courseName: "Tajweed",
    modules: [
      mod("4.1", "Makharij al-Huruf", {
        subjects: [
          "Meaning of Makharij",
          "Five general articulation areas",
          "Throat letters",
          "Tongue letters",
          "Lips",
          "Nasal passage",
          "Mouth cavity",
          "Similar letter pronunciation",
        ],
        mandatoryLearning: [
          "Correctly articulate the major Arabic letters and identify common pronunciation errors.",
        ],
      }),
      mod("4.2", "Noon Sakinah & Tanween", {
        subjects: [
          "Noon Sakinah",
          "Tanween",
          "Izhar",
          "Idgham",
          "Iqlab",
          "Ikhfa",
          "Practical Quranic examples",
        ],
        mandatoryLearning: ["Identify the four major rules and apply them while reciting."],
      }),
      mod("4.3", "Meem Sakinah, Qalqalah & Laam", {
        subjects: [
          "Meem Sakinah",
          "Ikhfa Shafawi",
          "Idgham Shafawi",
          "Izhar Shafawi",
          "Qalqalah",
          "Laam rules",
          "Heavy and light pronunciation",
        ],
        mandatoryLearning: ["Recognize and correctly apply these rules during recitation."],
      }),
      mod("4.4", "Madd, Waqf & Ibtida", {
        subjects: [
          "Basic Madd",
          "Types of Madd",
          "Quranic stopping signs",
          "Waqf",
          "Ibtida",
          "Where to stop",
          "Where not to stop",
          "Maintaining meaning while stopping",
        ],
        mandatoryLearning: ["Demonstrate correct basic Madd and appropriate stopping."],
      }),
    ],
  },
  {
    number: 5,
    title: "Tajweed Mastery & Recitation",
    subtitle: "Advanced Recitation",
    purpose: "Transform theoretical Tajweed knowledge into consistent practical recitation.",
    courseName: "Tajweed",
    modules: [
      mod("5.1", "Advanced Tajweed Rules", {
        subjects: [
          "Detailed Madd rules",
          "Advanced pronunciation",
          "Tafkhim",
          "Tarqiq",
          "Rules of Ra",
          "Rules of Laam",
          "Special Quranic pronunciation cases",
        ],
        mandatoryLearning: ["Apply advanced rules without relying continuously on reminders."],
      }),
      mod("5.2", "Waqf & Ibtida Mastery", {
        subjects: [
          "Types of stopping",
          "Appropriate starting points",
          "Quranic symbols",
          "Meaning-based stopping",
          "Avoiding incorrect pauses",
          "Practical examples",
        ],
        mandatoryLearning: ["Stop and restart verses appropriately while preserving meaning."],
      }),
      mod("5.3", "Recitation Development", {
        subjects: [
          "Breath management",
          "Reading rhythm",
          "Voice control",
          "Pace",
          "Clear pronunciation",
          "Listening to qualified reciters",
          "Repetition and imitation",
        ],
        mandatoryLearning: ["Maintain Tajweed while reading continuously."],
      }),
      mod("5.4", "Tajweed Mastery Examination", {
        assessment: [
          "Individual recitation",
          "Random Ayahs",
          "Rule identification",
          "Pronunciation testing",
          "Error correction",
          "Full Surah assessment",
        ],
      }),
    ],
  },
  {
    number: 6,
    title: "Hifz Foundation",
    subtitle: "Quran Memorization",
    purpose: "Teach students how to memorize Quran correctly and retain what they memorize.",
    courseName: "Hifz-ul-Quran",
    modules: [
      mod("6.1", "Memorization Fundamentals", {
        subjects: [
          "Intention",
          "Memorization discipline",
          "Listening before memorization",
          "Repetition",
          "Visual memorization",
          "Understanding before memorizing",
          "Daily schedule",
          "Revision techniques",
        ],
        mandatoryLearning: ["Establish a realistic daily memorization and revision routine."],
      }),
      mod("6.2", "Short Surah Memorization", {
        subjects: [
          "Al-Fatihah",
          "Juz Amma",
          "Selected short Surahs",
          "Correct pronunciation",
          "Meaning of memorized Surahs",
          "Daily revision",
        ],
        mandatoryLearning: [
          "Each Surah must be memorized with: Correct words + Correct sequence + Correct pronunciation + Basic understanding.",
        ],
      }),
      mod("6.3", "Hifz Methodology", {
        subjects: [
          "Sabaq — new lesson",
          "Sabqi — recent revision",
          "Daur — older revision",
          "Daily targets",
          "Weekly targets",
          "Monthly assessment",
          "Weak Ayah identification",
        ],
        mandatoryLearning: ["Understand and consistently follow the three-part revision system."],
      }),
      mod("6.4", "Hifz Assessment", {
        assessment: [
          "Random Ayah testing",
          "Continuation testing",
          "Surah testing",
          "Pronunciation",
          "Revision retention",
        ],
      }),
    ],
  },
  {
    number: 7,
    title: "Complete Hifz & Retention",
    courseName: "Hifz-ul-Quran",
    modules: [
      mod("7.1", "Early Ajza", {
        subjects: ["Juz 1–5", "Daily Sabaq", "Sabqi", "Daur", "Similar Ayahs", "Revision"],
      }),
      mod("7.2", "Middle Ajza", {
        subjects: [
          "Juz 6–15",
          "Longer passages",
          "Mutashabihat",
          "Weak-area tracking",
          "Revision schedules",
        ],
      }),
      mod("7.3", "Advanced Ajza", {
        subjects: ["Juz 16–25", "Difficult passages", "Similar verses", "Continuous revision"],
      }),
      mod("7.4", "Completion & Long-Term Retention", {
        subjects: [
          "Juz 26–30",
          "Complete Quran revision",
          "Random testing",
          "Full Quran assessment",
          "Post-Hifz maintenance plan",
        ],
        mandatoryLearning: [
          "Completion is not simply reaching the final Ayah. The student must demonstrate retention, accuracy and consistency across the memorized Quran.",
        ],
      }),
    ],
  },
  {
    number: 8,
    title: "Quran Translation & Understanding",
    courseName: "Quran Understanding",
    modules: [
      mod("8.1", "Quranic Vocabulary", {
        subjects: [
          "Common Quranic words",
          "Repeated words",
          "Root words",
          "Basic vocabulary",
          "Word-by-word meaning",
        ],
        mandatoryLearning: ["Recognize frequently repeated Quranic vocabulary."],
      }),
      mod("8.2", "Verse-by-Verse Understanding", {
        subjects: [
          "Selected Surahs",
          "Verse meanings",
          "Context",
          "Key words",
          "Main message",
          "Related verses",
        ],
        mandatoryLearning: ["Explain the basic meaning of studied verses in their own words."],
      }),
      mod("8.3", "Major Quranic Themes", {
        subjects: [
          "Tawheed",
          "Worship",
          "Prophets",
          "Akhirah",
          "Morality",
          "Family",
          "Justice",
          "Mercy",
          "Repentance",
          "Patience",
          "Gratitude",
        ],
        mandatoryLearning: ["Identify the major message/theme of selected Quranic passages."],
      }),
      mod("8.4", "Applying Quranic Guidance", {
        subjects: [
          "Personal life",
          "Family",
          "Work",
          "Relationships",
          "Character",
          "Difficulties",
          "Decision-making",
          "Social responsibility",
        ],
        mandatoryLearning: [
          "Connect Quranic teachings to appropriate everyday situations without treating personal opinions as Quranic rulings.",
        ],
      }),
    ],
  },
  {
    number: 9,
    title: "Arabic Grammar",
    courseName: "Quran Understanding",
    modules: [
      mod("9.1", "Arabic Grammar Foundation", {
        subjects: [
          "Nouns",
          "Pronouns",
          "Verbs",
          "Adjectives",
          "Prepositions",
          "Gender",
          "Number",
          "Basic sentence structures",
        ],
        mandatoryLearning: [
          "Identify basic grammatical components in simple Quranic phrases.",
        ],
      }),
      mod("9.2", "Sarf", {
        subjects: [
          "Arabic roots",
          "Verb patterns",
          "Past tense",
          "Present tense",
          "Commands",
          "Active/passive",
          "Derived forms",
        ],
        mandatoryLearning: ["Identify roots and basic verb patterns."],
      }),
      mod("9.3", "Quranic Application", {
        subjects: [
          "Word analysis",
          "Root identification",
          "Grammatical analysis",
          "Verse translation",
          "Vocabulary building",
          "Independent exercises",
        ],
      }),
    ],
  },
  {
    number: 10,
    title: "Tafsir & Quranic Understanding",
    courseName: "Quran Understanding",
    modules: [
      mod("10.1", "Introduction to Tafsir", {
        subjects: [
          "Meaning of Tafsir",
          "Purpose",
          "Sources",
          "Quran explaining Quran",
          "Hadith",
          "Language",
          "Context",
          "Early scholarship",
        ],
        mandatoryLearning: [
          "Understand why Quranic interpretation requires methodology and cannot simply be based on personal opinion.",
        ],
      }),
      mod("10.2", "Surah-Based Tafsir", {
        subjects: [
          "Background",
          "Theme",
          "Vocabulary",
          "Verse meaning",
          "Relevant Hadith",
          "Scholarly explanations",
          "Lessons",
        ],
      }),
      mod("10.3", "Thematic Tafsir", {
        subjects: [
          "Tawheed",
          "Salah",
          "Akhirah",
          "Family",
          "Justice",
          "Wealth",
          "Patience",
          "Repentance",
          "Character",
          "Society",
        ],
      }),
      mod("10.4", "Practical Quranic Reflection", {
        subjects: [
          "Personal development",
          "Spiritual growth",
          "Family",
          "Ethics",
          "Community",
          "Responsibility",
          "Reflection exercises",
        ],
      }),
    ],
  },
  {
    number: 11,
    title: "Aqeedah",
    courseName: "Islamic Studies",
    modules: [
      mod("11.1", "Six Articles of Faith", {
        subjects: ["Allah", "Angels", "Books", "Prophets", "Day of Judgment", "Qadr"],
        mandatoryLearning: ["Accurately explain the six fundamental articles of Iman."],
      }),
      mod("11.2", "Tawheed", {
        subjects: ["Oneness of Allah", "Worship", "Sincerity", "Du'a", "Reliance", "Shirk concepts"],
      }),
      mod("11.3", "Iman & Spiritual Development", {
        subjects: ["Taqwa", "Tawakkul", "Sabr", "Shukr", "Tawbah", "Dhikr", "Ikhlas"],
      }),
      mod("11.4", "Aqeedah in Daily Life", {
        subjects: [
          "Faith during hardship",
          "Fear and hope",
          "Gratitude",
          "Trust in Allah",
          "Personal responsibility",
        ],
      }),
    ],
  },
  {
    number: 12,
    title: "Fiqh & Worship",
    methodologyNote:
      "Where recognized schools differ, the app should clearly identify the school/methodology used and explain important differences rather than confusing students.",
    courseName: "Islamic Studies",
    modules: [
      mod("12.1", "Taharah", {
        subjects: ["Cleanliness", "Wudu", "Ghusl", "Tayammum", "Impurities", "Practical scenarios"],
        mandatoryLearning: [
          "Know when and how to perform the applicable purification procedures.",
        ],
      }),
      mod("12.2", "Salah", {
        subjects: [
          "Conditions",
          "Pillars",
          "Obligatory elements",
          "Sunnah practices",
          "Salah procedure",
          "Common mistakes",
          "Congregational Salah",
        ],
        mandatoryLearning: [
          "Perform Salah correctly according to the methodology taught by the course.",
        ],
      }),
      mod("12.3", "Fasting, Zakat & Hajj", {
        subjects: ["Ramadan", "Fasting", "Zakat", "Sadaqah", "Hajj", "Umrah", "Basic obligations"],
      }),
      mod("12.4", "Everyday Fiqh", {
        subjects: [
          "Food",
          "Clothing",
          "Business",
          "Family",
          "Marriage",
          "Financial dealings",
          "Social responsibilities",
        ],
      }),
    ],
  },
  {
    number: 13,
    title: "Hadith & Sunnah",
    courseName: "Islamic Studies",
    modules: [
      mod("13.1", "Understanding Hadith", {
        subjects: [
          "Hadith",
          "Sunnah",
          "Importance",
          "Sanad",
          "Matn",
          "Basic terminology",
          "Authenticity concepts",
        ],
        mandatoryLearning: [
          "Understand that Hadith has a scholarly methodology for transmission and evaluation.",
        ],
      }),
      mod("13.2", "Essential Hadith", {
        subjects: [
          "Intentions",
          "Knowledge",
          "Worship",
          "Parents",
          "Charity",
          "Honesty",
          "Mercy",
          "Character",
          "Neighbours",
        ],
      }),
      mod("13.3", "Daily Sunnah", {
        subjects: [
          "Eating",
          "Sleeping",
          "Dressing",
          "Greeting",
          "Travel",
          "Masjid",
          "Family",
          "Social interaction",
        ],
      }),
      mod("13.4", "Hadith Application", {
        subjects: [
          "Memorization",
          "Meaning",
          "Reflection",
          "Practical implementation",
          "Daily Sunnah challenges",
        ],
      }),
    ],
  },
  {
    number: 14,
    title: "Seerah",
    courseName: "Islamic Studies",
    modules: [
      mod("14.1", "Early Life", {
        subjects: ["Arabia", "Family", "Childhood", "Youth", "Character", "Marriage", "Society"],
      }),
      mod("14.2", "Makkah", {
        subjects: [
          "First revelation",
          "Early Muslims",
          "Da'wah",
          "Persecution",
          "Migration",
          "Major events",
        ],
      }),
      mod("14.3", "Madinah", {
        subjects: [
          "Hijrah",
          "Madinah",
          "Brotherhood",
          "Community",
          "Battles",
          "Treaties",
          "Social development",
        ],
      }),
      mod("14.4", "Final Years & Lessons", {
        subjects: [
          "Conquest of Makkah",
          "Farewell Hajj",
          "Final period",
          "Character",
          "Mercy",
          "Leadership",
          "Justice",
          "Lessons for Muslims",
        ],
        mandatoryLearning: [
          "Describe the major stages of the Prophet's ﷺ life and identify lessons from them.",
        ],
      }),
    ],
  },
  {
    number: 15,
    title: "Akhlaq & Adab",
    courseName: "Islamic Studies",
    modules: [
      mod("15.1", "Character of a Muslim", {
        subjects: [
          "Truthfulness",
          "Patience",
          "Humility",
          "Gratitude",
          "Forgiveness",
          "Self-control",
        ],
      }),
      mod("15.2", "Family Ethics", {
        subjects: [
          "Parents",
          "Children",
          "Spouses",
          "Relatives",
          "Responsibilities",
          "Conflict resolution",
        ],
      }),
      mod("15.3", "Community Ethics", {
        subjects: ["Neighbours", "Friends", "Guests", "Helping others", "Respect", "Cooperation"],
      }),
      mod("15.4", "Digital Muslim Ethics", {
        subjects: [
          "Social media",
          "Online speech",
          "Privacy",
          "Gossip",
          "Backbiting",
          "Rumors",
          "Cyberbullying",
          "Online business",
          "Responsible technology use",
        ],
        mandatoryLearning: [
          "Apply Islamic manners in both physical and digital environments.",
        ],
      }),
    ],
  },
  {
    number: 16,
    title: "Duas & Azkar",
    methodologyNote:
      "The app should prioritize authentic, properly sourced duas, with Arabic, transliteration where appropriate, translation, pronunciation and context.",
    courseName: "Islamic Studies",
    modules: [
      mod("16.1", "Morning & Evening", {
        subjects: ["Morning Azkar", "Evening Azkar", "Protection", "Dhikr", "Istighfar"],
      }),
      mod("16.2", "Daily Life", {
        subjects: ["Sleeping", "Waking", "Eating", "Traveling", "Home", "Clothing", "Bathroom"],
      }),
      mod("16.3", "Worship", {
        subjects: ["Salah supplications", "Ramadan", "After Salah", "Salawat", "Repentance"],
      }),
      mod("16.4", "Life Situations", {
        subjects: [
          "Difficulty",
          "Fear",
          "Illness",
          "Parents",
          "Knowledge",
          "Guidance",
          "Forgiveness",
        ],
      }),
    ],
  },
  {
    number: 17,
    title: "Stories of the Prophets",
    courseName: "Islamic Studies",
    modules: [
      mod("17.1", "Early Prophets", {
        subjects: [
          "Adam عليه السلام",
          "Nuh عليه السلام",
          "Hud عليه السلام",
          "Salih عليه السلام",
          "Ibrahim عليه السلام",
        ],
      }),
      mod("17.2", "Family of Ibrahim", {
        subjects: [
          "Ismail عليه السلام",
          "Ishaq عليه السلام",
          "Yaqub عليه السلام",
          "Yusuf عليه السلام",
          "Lut عليه السلام",
        ],
      }),
      mod("17.3", "Musa & Other Prophets", {
        subjects: [
          "Musa عليه السلام",
          "Harun عليه السلام",
          "Dawud عليه السلام",
          "Sulaiman عليه السلام",
          "Ayyub عليه السلام",
          "Yunus عليه السلام",
        ],
      }),
      mod("17.4", "Later Prophets & Lessons", {
        subjects: [
          "Zakariya عليه السلام",
          "Yahya عليه السلام",
          "Isa عليه السلام",
          "Faith",
          "Patience",
          "Obedience",
          "Tawakkul",
          "Repentance",
        ],
      }),
    ],
  },
  {
    number: 18,
    title: "Islamic History & Civilization",
    courseName: "Islamic Studies",
    modules: [
      mod("18.1", "Khulafa al-Rashidun", {
        subjects: [
          "Abu Bakr رضي الله عنه",
          "Umar رضي الله عنه",
          "Uthman رضي الله عنه",
          "Ali رضي الله عنه",
        ],
      }),
      mod("18.2", "Islamic Scholarship", {
        subjects: [
          "Quran scholarship",
          "Hadith scholarship",
          "Fiqh scholarship",
          "Tafsir",
          "Arabic",
          "Major scholarly traditions",
        ],
      }),
      mod("18.3", "Islamic Civilization", {
        subjects: [
          "Education",
          "Science",
          "Medicine",
          "Mathematics",
          "Literature",
          "Architecture",
          "Libraries",
        ],
      }),
      mod("18.4", "Historical Lessons", {
        subjects: [
          "Leadership",
          "Justice",
          "Knowledge",
          "Social responsibility",
          "Civilization",
          "Ethical conduct",
        ],
      }),
    ],
  },
  {
    number: 19,
    title: "Ulum al-Quran",
    subtitle: "Advanced — 16+",
    minAge: 16,
    courseName: "Advanced Quranic Studies",
    modules: [
      mod("19.1", "Revelation & Compilation", {
        subjects: [
          "Wahy",
          "Revelation",
          "Makki/Madani",
          "Asbab al-Nuzul",
          "Compilation",
          "Preservation",
        ],
      }),
      mod("19.2", "Quranic Structure", {
        subjects: ["Surahs", "Ayahs", "Rasm", "Mushaf", "Waqf", "Ibtida"],
      }),
      mod("19.3", "Specialized Quranic Sciences", {
        subjects: [
          "Muhkam",
          "Mutashabih",
          "Nasikh/Mansukh",
          "Gharib al-Quran",
          "Quranic terminology",
          "Qira'at introduction",
        ],
      }),
      mod("19.4", "Research Methodology", {
        subjects: [
          "Selecting sources",
          "Evaluating sources",
          "Tafsir references",
          "Thematic research",
          "Academic writing",
          "Presenting findings",
        ],
      }),
    ],
  },
  {
    number: 20,
    title: "Qira'at & Advanced Recitation",
    subtitle: "Advanced / Expert",
    courseName: "Advanced Quranic Studies",
    modules: [
      mod("20.1", "Introduction to Qira'at", {
        subjects: ["Meaning", "History", "Terminology", "Relationship with Tajweed", "Transmission"],
      }),
      mod("20.2", "Advanced Recitation", {
        subjects: [
          "Selected recitations",
          "Differences",
          "Practical listening",
          "Pronunciation",
          "Recitation exercises",
        ],
      }),
      mod("20.3", "Comparative Qira'at", {
        subjects: [
          "Selected examples",
          "Recitation variations",
          "Scholarly transmission",
          "Methodological understanding",
        ],
      }),
      mod("20.4", "Advanced Assessment", {
        assessment: [
          "Recitation",
          "Error correction",
          "Memorization",
          "Teacher evaluation",
          "Advanced certification pathway",
        ],
      }),
    ],
  },
  {
    number: 21,
    title: "Advanced Tafsir & Quranic Research",
    courseName: "Advanced Quranic Studies",
    modules: [
      mod("21.1", "Tafsir Methodology", {
        subjects: ["Sources", "Principles", "Context", "Language", "Hadith", "Early scholarship"],
      }),
      mod("21.2", "Classical Tafsir", {
        subjects: [
          "Major traditions",
          "Linguistic Tafsir",
          "Fiqhi Tafsir",
          "Thematic Tafsir",
          "Comparative study",
        ],
      }),
      mod("21.3", "Contemporary Quranic Issues", {
        subjects: [
          "Family",
          "Ethics",
          "Society",
          "Economics",
          "Technology",
          "Environment",
          "Contemporary questions",
        ],
      }),
      mod("21.4", "Research Project", {
        subjects: [
          "Selects a topic",
          "Finds appropriate sources",
          "Studies relevant verses",
          "Reviews scholarly interpretations",
          "Organizes findings",
          "Produces a research project",
          "Presents the findings",
        ],
      }),
    ],
  },
  {
    number: 22,
    title: "Quran Teacher & Ijazah Preparation",
    subtitle: "Expert Pathway",
    purpose:
      "An Ijazah should only be represented as an actual Ijazah where it is granted by an appropriately qualified scholar/teacher according to the relevant tradition; completing an app course alone should not automatically be described as Ijazah.",
    courseName: "Quran Teacher Preparation",
    modules: [
      mod("22.1", "Teaching Quran", {
        subjects: [
          "Teaching Qaida",
          "Teaching Nazra",
          "Teaching Tajweed",
          "Pronunciation correction",
          "Teaching children",
          "Teaching adults",
        ],
      }),
      mod("22.2", "Student Assessment", {
        subjects: [
          "Initial assessment",
          "Learning-level placement",
          "Progress monitoring",
          "Mistake identification",
          "Personalized learning plans",
          "Revision planning",
        ],
      }),
      mod("22.3", "Teaching Practicum", {
        subjects: [
          "Demonstration lessons",
          "Mock classes",
          "Live teaching",
          "Student interaction",
          "Feedback",
          "Lesson planning",
        ],
      }),
      mod("22.4", "Final Assessment", {
        assessment: [
          "Tajweed examination",
          "Quran recitation",
          "Teaching demonstration",
          "Knowledge examination",
          "Student management",
          "Final instructor evaluation",
        ],
      }),
    ],
  },
];
