import type { Language, StoreItemLevel, StoreItemType } from "@/lib/generated/prisma/client";

// Curriculum-aligned store catalogue used by prisma/seed-store.ts. Everything is
// free, in line with the platform's promise. No cover images or links are set
// here: admins attach the real files from the Store admin page.

export type CatalogueModule = { title: string; description: string; durationMins: number };

export type CatalogueItem = {
  title: string;
  description: string;
  type: StoreItemType;
  level: StoreItemLevel;
  language: Language;
  pricePence: number;
  durationMins?: number;
  modules: CatalogueModule[];
};

export const STORE_CATALOGUE: CatalogueItem[] = [
  {
    title: "Noorani Qaida: Step-by-Step Course",
    description:
      "A gentle self-study companion to Levels 1–2. Learn the Arabic letters, their sounds and the vowel signs, then join letters into Quranic words — one short lesson at a time.",
    type: "COURSE",
    level: "BEGINNER",
    language: "EN",
    pricePence: 0,
    modules: [
      { title: "The Arabic alphabet", description: "All 29 letters, their names and sounds, and similar-looking letters.", durationMins: 30 },
      { title: "Letter shapes", description: "Beginning, middle and end forms, and which letters do not join.", durationMins: 25 },
      { title: "Harakat — the vowel signs", description: "Fathah, kasrah, dammah, sukoon, tanween and shaddah with listening practice.", durationMins: 35 },
      { title: "Joining letters", description: "Reading two-, three- and four-letter combinations from right to left.", durationMins: 30 },
      { title: "Reading Quranic words", description: "Common Quranic words with madd, shaddah and sukoon.", durationMins: 30 },
    ],
  },
  {
    title: "Quranic Vocabulary Builder",
    description:
      "Learn the words that appear most often in the Quran, with their root letters and simple meanings, so you begin to understand what you recite. Supports Level 8.",
    type: "COURSE",
    level: "INTERMEDIATE",
    language: "EN",
    pricePence: 0,
    modules: [
      { title: "The most frequent words", description: "High-frequency words you meet on almost every page.", durationMins: 25 },
      { title: "Root letters", description: "How three-letter roots build families of related words.", durationMins: 30 },
      { title: "Words in Al-Fatihah", description: "Word-by-word meaning of the opening surah.", durationMins: 20 },
      { title: "Words in short surahs", description: "Vocabulary from the short surahs of Juz Amma.", durationMins: 30 },
    ],
  },
  {
    title: "Arabic Alphabet Flashcards",
    description:
      "Printable flashcards for every Arabic letter showing its name and its beginning, middle and end forms. Ideal for children and beginners practising at home.",
    type: "DOCUMENT",
    level: "BEGINNER",
    language: "EN",
    pricePence: 0,
    durationMins: 15,
    modules: [],
  },
  {
    title: "Tajweed Rules Quick Reference",
    description:
      "A clear, one-page-per-rule guide to Noon Sakinah and Tanween, Meem Sakinah, Qalqalah and Madd, with a short explanation of each. A handy companion to Levels 4–5.",
    type: "DOCUMENT",
    level: "INTERMEDIATE",
    language: "EN",
    pricePence: 0,
    durationMins: 20,
    modules: [],
  },
  {
    title: "Juz Amma Memorisation Planner",
    description:
      "A printable planner built on the Sabaq (new lesson), Sabqi (recent revision) and Daur (older revision) routine, with daily and weekly targets. Supports Level 6.",
    type: "DOCUMENT",
    level: "INTERMEDIATE",
    language: "EN",
    pricePence: 0,
    durationMins: 10,
    modules: [],
  },
  {
    title: "Daily Duas & Azkar Booklet",
    description:
      "Everyday supplications for morning and evening, eating, sleeping, travelling and entering the home — with Arabic, transliteration and meaning. Duas should be checked against their authentic sources by your teacher.",
    type: "DOCUMENT",
    level: "ALL_LEVELS",
    language: "EN",
    pricePence: 0,
    durationMins: 20,
    modules: [],
  },
  {
    title: "Wudu and Salah, Step by Step",
    description:
      "A calm, clearly paced video walk-through of making wudu and praying, explained simply for new Muslims, children and anyone who wants a refresher. Supports Levels 1 and 12.",
    type: "VIDEO",
    level: "BEGINNER",
    language: "EN",
    pricePence: 0,
    durationMins: 25,
    modules: [],
  },
  {
    title: "Makharij Pronunciation Practice",
    description:
      "Audio drills for the articulation points of the Arabic letters — throat, tongue and lips — with pauses to listen and repeat. Helpful before and during Level 4.",
    type: "AUDIO",
    level: "BEGINNER",
    language: "EN",
    pricePence: 0,
    durationMins: 30,
    modules: [],
  },
  {
    title: "Stories of the Prophets",
    description:
      "Story-led lessons about the Prophets mentioned in the Quran, told simply for families and focusing on faith, patience and trust in Allah. Supports Level 17.",
    type: "HISTORICAL_STORY",
    level: "ALL_LEVELS",
    language: "EN",
    pricePence: 0,
    modules: [
      { title: "Prophet Adam (AS)", description: "The first human and the meaning of repentance.", durationMins: 15 },
      { title: "Prophet Nuh (AS)", description: "Patience over many years and the great flood.", durationMins: 15 },
      { title: "Prophet Ibrahim (AS)", description: "Faith, sincerity and the building of the Ka'bah.", durationMins: 15 },
      { title: "Prophet Yusuf (AS)", description: "Patience, forgiveness and trust through hardship.", durationMins: 20 },
      { title: "Prophet Musa (AS)", description: "Courage and reliance on Allah.", durationMins: 20 },
    ],
  },
  {
    title: "The Life of the Prophet Muhammad ﷺ",
    description:
      "An introduction to the Seerah, from his early life in Makkah to the final years in Madinah, with lessons for everyday life. Supports Level 14.",
    type: "HISTORICAL_STORY",
    level: "ALL_LEVELS",
    language: "EN",
    pricePence: 0,
    modules: [
      { title: "Early life", description: "Arabia, his family, childhood and character before prophethood.", durationMins: 20 },
      { title: "The years in Makkah", description: "The first revelation, the early Muslims and their patience.", durationMins: 20 },
      { title: "The years in Madinah", description: "The Hijrah, brotherhood and building a community.", durationMins: 20 },
      { title: "Final years and lessons", description: "The Farewell Hajj and lessons of mercy and justice.", durationMins: 20 },
    ],
  },
];
