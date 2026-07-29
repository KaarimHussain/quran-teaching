// Quran data layer — fetches from api.quran.com and provides the surah list.

export type QuranWord = {
  id: number;
  position: number;
  text: string;
  transliteration: string;
  translation: string;
  audioUrl: string;
};

export type QuranVerse = {
  id: number;
  verseNumber: number;
  verseKey: string;
  words: QuranWord[];
  translationText: string;
  tajweedHtml: string;
};

export type Surah = {
  id: number;
  nameArabic: string;
  nameSimple: string;
  nameTranslated: string;
  versesCount: number;
};

export const SURAHS: Surah[] = [
  { id: 1,   nameArabic: "الفاتحة",    nameSimple: "Al-Fatihah",      nameTranslated: "The Opening",                     versesCount: 7   },
  { id: 2,   nameArabic: "البقرة",     nameSimple: "Al-Baqarah",      nameTranslated: "The Cow",                         versesCount: 286 },
  { id: 3,   nameArabic: "آل عمران",   nameSimple: "Ali 'Imran",      nameTranslated: "Family of Imran",                 versesCount: 200 },
  { id: 4,   nameArabic: "النساء",     nameSimple: "An-Nisa",         nameTranslated: "The Women",                       versesCount: 176 },
  { id: 5,   nameArabic: "المائدة",    nameSimple: "Al-Ma'idah",      nameTranslated: "The Table Spread",                versesCount: 120 },
  { id: 6,   nameArabic: "الأنعام",    nameSimple: "Al-An'am",        nameTranslated: "The Cattle",                      versesCount: 165 },
  { id: 7,   nameArabic: "الأعراف",    nameSimple: "Al-A'raf",        nameTranslated: "The Heights",                     versesCount: 206 },
  { id: 8,   nameArabic: "الأنفال",    nameSimple: "Al-Anfal",        nameTranslated: "The Spoils of War",               versesCount: 75  },
  { id: 9,   nameArabic: "التوبة",     nameSimple: "At-Tawbah",       nameTranslated: "The Repentance",                  versesCount: 129 },
  { id: 10,  nameArabic: "يونس",       nameSimple: "Yunus",           nameTranslated: "Jonah",                           versesCount: 109 },
  { id: 11,  nameArabic: "هود",        nameSimple: "Hud",             nameTranslated: "Hud",                             versesCount: 123 },
  { id: 12,  nameArabic: "يوسف",       nameSimple: "Yusuf",           nameTranslated: "Joseph",                          versesCount: 111 },
  { id: 13,  nameArabic: "الرعد",      nameSimple: "Ar-Ra'd",         nameTranslated: "The Thunder",                     versesCount: 43  },
  { id: 14,  nameArabic: "إبراهيم",    nameSimple: "Ibrahim",         nameTranslated: "Abraham",                         versesCount: 52  },
  { id: 15,  nameArabic: "الحجر",      nameSimple: "Al-Hijr",         nameTranslated: "The Rocky Tract",                 versesCount: 99  },
  { id: 16,  nameArabic: "النحل",      nameSimple: "An-Nahl",         nameTranslated: "The Bee",                         versesCount: 128 },
  { id: 17,  nameArabic: "الإسراء",    nameSimple: "Al-Isra",         nameTranslated: "The Night Journey",               versesCount: 111 },
  { id: 18,  nameArabic: "الكهف",      nameSimple: "Al-Kahf",         nameTranslated: "The Cave",                        versesCount: 110 },
  { id: 19,  nameArabic: "مريم",       nameSimple: "Maryam",          nameTranslated: "Mary",                            versesCount: 98  },
  { id: 20,  nameArabic: "طه",         nameSimple: "Ta-Ha",           nameTranslated: "Ta-Ha",                           versesCount: 135 },
  { id: 21,  nameArabic: "الأنبياء",   nameSimple: "Al-Anbiya",       nameTranslated: "The Prophets",                    versesCount: 112 },
  { id: 22,  nameArabic: "الحج",       nameSimple: "Al-Hajj",         nameTranslated: "The Pilgrimage",                  versesCount: 78  },
  { id: 23,  nameArabic: "المؤمنون",   nameSimple: "Al-Mu'minun",     nameTranslated: "The Believers",                   versesCount: 118 },
  { id: 24,  nameArabic: "النور",      nameSimple: "An-Nur",          nameTranslated: "The Light",                       versesCount: 64  },
  { id: 25,  nameArabic: "الفرقان",    nameSimple: "Al-Furqan",       nameTranslated: "The Criterion",                   versesCount: 77  },
  { id: 26,  nameArabic: "الشعراء",    nameSimple: "Ash-Shu'ara",     nameTranslated: "The Poets",                       versesCount: 227 },
  { id: 27,  nameArabic: "النمل",      nameSimple: "An-Naml",         nameTranslated: "The Ant",                         versesCount: 93  },
  { id: 28,  nameArabic: "القصص",      nameSimple: "Al-Qasas",        nameTranslated: "The Stories",                     versesCount: 88  },
  { id: 29,  nameArabic: "العنكبوت",   nameSimple: "Al-'Ankabut",     nameTranslated: "The Spider",                      versesCount: 69  },
  { id: 30,  nameArabic: "الروم",      nameSimple: "Ar-Rum",          nameTranslated: "The Romans",                      versesCount: 60  },
  { id: 31,  nameArabic: "لقمان",      nameSimple: "Luqman",          nameTranslated: "Luqman",                          versesCount: 34  },
  { id: 32,  nameArabic: "السجدة",     nameSimple: "As-Sajdah",       nameTranslated: "The Prostration",                 versesCount: 30  },
  { id: 33,  nameArabic: "الأحزاب",    nameSimple: "Al-Ahzab",        nameTranslated: "The Combined Forces",             versesCount: 73  },
  { id: 34,  nameArabic: "سبأ",        nameSimple: "Saba",            nameTranslated: "Sheba",                           versesCount: 54  },
  { id: 35,  nameArabic: "فاطر",       nameSimple: "Fatir",           nameTranslated: "Originator",                      versesCount: 45  },
  { id: 36,  nameArabic: "يس",         nameSimple: "Ya-Sin",          nameTranslated: "Ya-Sin",                          versesCount: 83  },
  { id: 37,  nameArabic: "الصافات",    nameSimple: "As-Saffat",       nameTranslated: "Those Who Set the Ranks",         versesCount: 182 },
  { id: 38,  nameArabic: "ص",          nameSimple: "Sad",             nameTranslated: "The Letter Sad",                  versesCount: 88  },
  { id: 39,  nameArabic: "الزمر",      nameSimple: "Az-Zumar",        nameTranslated: "The Troops",                      versesCount: 75  },
  { id: 40,  nameArabic: "غافر",       nameSimple: "Ghafir",          nameTranslated: "The Forgiver",                    versesCount: 85  },
  { id: 41,  nameArabic: "فصلت",       nameSimple: "Fussilat",        nameTranslated: "Explained in Detail",             versesCount: 54  },
  { id: 42,  nameArabic: "الشورى",     nameSimple: "Ash-Shuraa",      nameTranslated: "The Consultation",                versesCount: 53  },
  { id: 43,  nameArabic: "الزخرف",     nameSimple: "Az-Zukhruf",      nameTranslated: "The Ornaments of Gold",           versesCount: 89  },
  { id: 44,  nameArabic: "الدخان",     nameSimple: "Ad-Dukhan",       nameTranslated: "The Smoke",                       versesCount: 59  },
  { id: 45,  nameArabic: "الجاثية",    nameSimple: "Al-Jathiyah",     nameTranslated: "The Crouching",                   versesCount: 37  },
  { id: 46,  nameArabic: "الأحقاف",    nameSimple: "Al-Ahqaf",        nameTranslated: "The Wind-Curved Sandhills",       versesCount: 35  },
  { id: 47,  nameArabic: "محمد",       nameSimple: "Muhammad",        nameTranslated: "Muhammad",                        versesCount: 38  },
  { id: 48,  nameArabic: "الفتح",      nameSimple: "Al-Fath",         nameTranslated: "The Victory",                     versesCount: 29  },
  { id: 49,  nameArabic: "الحجرات",    nameSimple: "Al-Hujurat",      nameTranslated: "The Rooms",                       versesCount: 18  },
  { id: 50,  nameArabic: "ق",          nameSimple: "Qaf",             nameTranslated: "The Letter Qaf",                  versesCount: 45  },
  { id: 51,  nameArabic: "الذاريات",   nameSimple: "Adh-Dhariyat",    nameTranslated: "The Winnowing Winds",             versesCount: 60  },
  { id: 52,  nameArabic: "الطور",      nameSimple: "At-Tur",          nameTranslated: "The Mount",                       versesCount: 49  },
  { id: 53,  nameArabic: "النجم",      nameSimple: "An-Najm",         nameTranslated: "The Star",                        versesCount: 62  },
  { id: 54,  nameArabic: "القمر",      nameSimple: "Al-Qamar",        nameTranslated: "The Moon",                        versesCount: 55  },
  { id: 55,  nameArabic: "الرحمن",     nameSimple: "Ar-Rahman",       nameTranslated: "The Beneficent",                  versesCount: 78  },
  { id: 56,  nameArabic: "الواقعة",    nameSimple: "Al-Waqi'ah",      nameTranslated: "The Inevitable",                  versesCount: 96  },
  { id: 57,  nameArabic: "الحديد",     nameSimple: "Al-Hadid",        nameTranslated: "The Iron",                        versesCount: 29  },
  { id: 58,  nameArabic: "المجادلة",   nameSimple: "Al-Mujadila",     nameTranslated: "The Pleading Woman",              versesCount: 22  },
  { id: 59,  nameArabic: "الحشر",      nameSimple: "Al-Hashr",        nameTranslated: "The Exile",                       versesCount: 24  },
  { id: 60,  nameArabic: "الممتحنة",   nameSimple: "Al-Mumtahanah",   nameTranslated: "She That Is to be Examined",      versesCount: 13  },
  { id: 61,  nameArabic: "الصف",       nameSimple: "As-Saf",          nameTranslated: "The Ranks",                       versesCount: 14  },
  { id: 62,  nameArabic: "الجمعة",     nameSimple: "Al-Jumu'ah",      nameTranslated: "The Congregation",                versesCount: 11  },
  { id: 63,  nameArabic: "المنافقون",  nameSimple: "Al-Munafiqun",    nameTranslated: "The Hypocrites",                  versesCount: 11  },
  { id: 64,  nameArabic: "التغابن",    nameSimple: "At-Taghabun",     nameTranslated: "The Mutual Disillusion",          versesCount: 18  },
  { id: 65,  nameArabic: "الطلاق",     nameSimple: "At-Talaq",        nameTranslated: "The Divorce",                     versesCount: 12  },
  { id: 66,  nameArabic: "التحريم",    nameSimple: "At-Tahrim",       nameTranslated: "The Prohibition",                 versesCount: 12  },
  { id: 67,  nameArabic: "الملك",      nameSimple: "Al-Mulk",         nameTranslated: "The Sovereignty",                 versesCount: 30  },
  { id: 68,  nameArabic: "القلم",      nameSimple: "Al-Qalam",        nameTranslated: "The Pen",                         versesCount: 52  },
  { id: 69,  nameArabic: "الحاقة",     nameSimple: "Al-Haqqah",       nameTranslated: "The Reality",                     versesCount: 52  },
  { id: 70,  nameArabic: "المعارج",    nameSimple: "Al-Ma'arij",      nameTranslated: "The Ascending Stairways",         versesCount: 44  },
  { id: 71,  nameArabic: "نوح",        nameSimple: "Nuh",             nameTranslated: "Noah",                            versesCount: 28  },
  { id: 72,  nameArabic: "الجن",       nameSimple: "Al-Jinn",         nameTranslated: "The Jinn",                        versesCount: 28  },
  { id: 73,  nameArabic: "المزمل",     nameSimple: "Al-Muzzammil",    nameTranslated: "The Enshrouded One",              versesCount: 20  },
  { id: 74,  nameArabic: "المدثر",     nameSimple: "Al-Muddaththir",  nameTranslated: "The Cloaked One",                 versesCount: 56  },
  { id: 75,  nameArabic: "القيامة",    nameSimple: "Al-Qiyamah",      nameTranslated: "The Resurrection",                versesCount: 40  },
  { id: 76,  nameArabic: "الإنسان",    nameSimple: "Al-Insan",        nameTranslated: "The Human",                       versesCount: 31  },
  { id: 77,  nameArabic: "المرسلات",   nameSimple: "Al-Mursalat",     nameTranslated: "The Emissaries",                  versesCount: 50  },
  { id: 78,  nameArabic: "النبأ",      nameSimple: "An-Naba",         nameTranslated: "The Tidings",                     versesCount: 40  },
  { id: 79,  nameArabic: "النازعات",   nameSimple: "An-Nazi'at",      nameTranslated: "Those Who Drag Forth",            versesCount: 46  },
  { id: 80,  nameArabic: "عبس",        nameSimple: "Abasa",           nameTranslated: "He Frowned",                      versesCount: 42  },
  { id: 81,  nameArabic: "التكوير",    nameSimple: "At-Takwir",       nameTranslated: "The Overthrowing",                versesCount: 29  },
  { id: 82,  nameArabic: "الانفطار",   nameSimple: "Al-Infitar",      nameTranslated: "The Cleaving",                    versesCount: 19  },
  { id: 83,  nameArabic: "المطففين",   nameSimple: "Al-Mutaffifin",   nameTranslated: "The Defrauding",                  versesCount: 36  },
  { id: 84,  nameArabic: "الانشقاق",   nameSimple: "Al-Inshiqaq",     nameTranslated: "The Sundering",                   versesCount: 25  },
  { id: 85,  nameArabic: "البروج",     nameSimple: "Al-Buruj",        nameTranslated: "The Mansions of the Stars",       versesCount: 22  },
  { id: 86,  nameArabic: "الطارق",     nameSimple: "At-Tariq",        nameTranslated: "The Nightcomer",                  versesCount: 17  },
  { id: 87,  nameArabic: "الأعلى",     nameSimple: "Al-A'la",         nameTranslated: "The Most High",                   versesCount: 19  },
  { id: 88,  nameArabic: "الغاشية",    nameSimple: "Al-Ghashiyah",    nameTranslated: "The Overwhelming",                versesCount: 26  },
  { id: 89,  nameArabic: "الفجر",      nameSimple: "Al-Fajr",         nameTranslated: "The Dawn",                        versesCount: 30  },
  { id: 90,  nameArabic: "البلد",      nameSimple: "Al-Balad",        nameTranslated: "The City",                        versesCount: 20  },
  { id: 91,  nameArabic: "الشمس",      nameSimple: "Ash-Shams",       nameTranslated: "The Sun",                         versesCount: 15  },
  { id: 92,  nameArabic: "الليل",      nameSimple: "Al-Layl",         nameTranslated: "The Night",                       versesCount: 21  },
  { id: 93,  nameArabic: "الضحى",      nameSimple: "Ad-Duha",         nameTranslated: "The Morning Hours",               versesCount: 11  },
  { id: 94,  nameArabic: "الشرح",      nameSimple: "Ash-Sharh",       nameTranslated: "The Relief",                      versesCount: 8   },
  { id: 95,  nameArabic: "التين",      nameSimple: "At-Tin",          nameTranslated: "The Fig",                         versesCount: 8   },
  { id: 96,  nameArabic: "العلق",      nameSimple: "Al-Alaq",         nameTranslated: "The Clot",                        versesCount: 19  },
  { id: 97,  nameArabic: "القدر",      nameSimple: "Al-Qadr",         nameTranslated: "The Power",                       versesCount: 5   },
  { id: 98,  nameArabic: "البينة",     nameSimple: "Al-Bayyinah",     nameTranslated: "The Clear Proof",                 versesCount: 8   },
  { id: 99,  nameArabic: "الزلزلة",    nameSimple: "Az-Zalzalah",     nameTranslated: "The Earthquake",                  versesCount: 8   },
  { id: 100, nameArabic: "العاديات",   nameSimple: "Al-'Adiyat",      nameTranslated: "The Courser",                     versesCount: 11  },
  { id: 101, nameArabic: "القارعة",    nameSimple: "Al-Qari'ah",      nameTranslated: "The Calamity",                    versesCount: 11  },
  { id: 102, nameArabic: "التكاثر",    nameSimple: "At-Takathur",     nameTranslated: "The Rivalry in World Increase",   versesCount: 8   },
  { id: 103, nameArabic: "العصر",      nameSimple: "Al-'Asr",         nameTranslated: "The Declining Day",               versesCount: 3   },
  { id: 104, nameArabic: "الهمزة",     nameSimple: "Al-Humazah",      nameTranslated: "The Traducer",                    versesCount: 9   },
  { id: 105, nameArabic: "الفيل",      nameSimple: "Al-Fil",          nameTranslated: "The Elephant",                    versesCount: 5   },
  { id: 106, nameArabic: "قريش",       nameSimple: "Quraysh",         nameTranslated: "Quraysh",                         versesCount: 4   },
  { id: 107, nameArabic: "الماعون",    nameSimple: "Al-Ma'un",        nameTranslated: "The Small Kindnesses",            versesCount: 7   },
  { id: 108, nameArabic: "الكوثر",     nameSimple: "Al-Kawthar",      nameTranslated: "The Abundance",                   versesCount: 3   },
  { id: 109, nameArabic: "الكافرون",   nameSimple: "Al-Kafirun",      nameTranslated: "The Disbelievers",                versesCount: 6   },
  { id: 110, nameArabic: "النصر",      nameSimple: "An-Nasr",         nameTranslated: "The Divine Support",              versesCount: 3   },
  { id: 111, nameArabic: "المسد",      nameSimple: "Al-Masad",        nameTranslated: "The Palm Fibre",                  versesCount: 5   },
  { id: 112, nameArabic: "الإخلاص",    nameSimple: "Al-Ikhlas",       nameTranslated: "The Sincerity",                   versesCount: 4   },
  { id: 113, nameArabic: "الفلق",      nameSimple: "Al-Falaq",        nameTranslated: "The Daybreak",                    versesCount: 5   },
  { id: 114, nameArabic: "الناس",      nameSimple: "An-Nas",          nameTranslated: "Mankind",                         versesCount: 6   },
];

const AUDIO_CDN = "https://audio.qurancdn.com/";

// Convert <tajweed class="rule"> tags from the API into <span class="tj-rule">
// so our CSS can color them without dangerously injecting unknown tag names.
function parseTajweedHtml(raw: string): string {
  return raw
    .replace(/<tajweed class="([^"]+)">/g, '<span class="tj tj-$1">')
    .replace(/<\/tajweed>/g, "</span>");
}

export async function fetchSurahVerses(surahId: number): Promise<QuranVerse[]> {
  const all: QuranVerse[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?words=true&word_fields=text_uthmani,transliteration_en,translation_en&translations=131&fields=text_uthmani_tajweed&per_page=50&page=${page}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) throw new Error(`Quran API error: ${res.status}`);

    const data = await res.json();

    for (const v of data.verses) {
      all.push({
        id: v.id,
        verseNumber: v.verse_number,
        verseKey: v.verse_key,
        words: (v.words ?? [])
          .filter((w: Record<string, unknown>) => w.char_type_name === "word")
          .map((w: Record<string, unknown>) => {
            const trans = w.transliteration as Record<string, string> | null;
            const transl = w.translation as Record<string, string> | null;
            const audioPath = (w.audio_url as string | null) ?? "";
            return {
              id: w.id as number,
              position: w.position as number,
              text: (w.text_uthmani as string) ?? "",
              transliteration: trans?.text ?? "",
              translation: transl?.text ?? "",
              audioUrl: audioPath ? AUDIO_CDN + audioPath : "",
            } satisfies QuranWord;
          }),
        translationText: ((v.translations as Array<{ text: string }> | null)?.[0]?.text ?? "").replace(/<[^>]*>/g, ""),
        tajweedHtml: parseTajweedHtml((v.text_uthmani_tajweed as string | null) ?? ""),
      });
    }

    if (!data.pagination?.next_page) break;
    page++;
    if (page > 10) break;
  }

  return all;
}
