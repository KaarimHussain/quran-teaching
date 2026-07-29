"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Surah, QuranVerse, QuranWord } from "@/lib/quran";
import { ChevronLeft, ChevronRight, Volume2, X, BookOpen, Palette } from "lucide-react";

type Props = {
  surah: Surah;
  verses: QuranVerse[];
  allSurahs: Surah[];
};

type SelectedWord = QuranWord & { verseKey: string };

export function QuranReader({ surah, verses, allSurahs }: Props) {
  const router = useRouter();
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [tajweedMode, setTajweedMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((url: string) => {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, []);

  const handleWordClick = useCallback(
    (word: QuranWord, verseKey: string) => {
      setSelectedWord({ ...word, verseKey });
      if (word.audioUrl) playAudio(word.audioUrl);
    },
    [playAudio]
  );

  const navigate = (id: number) => {
    router.push(`/quran/${id}`);
  };

  const prevId = surah.id > 1 ? surah.id - 1 : null;
  const nextId = surah.id < 114 ? surah.id + 1 : null;

  const prevSurah = prevId ? allSurahs.find((s) => s.id === prevId) : null;
  const nextSurah = nextId ? allSurahs.find((s) => s.id === nextId) : null;

  const isBismillahSurah = surah.id !== 1 && surah.id !== 9;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <BookOpen className="h-5 w-5 shrink-0 text-primary" />

          {/* Surah selector */}
          <select
            value={surah.id}
            onChange={(e) => navigate(parseInt(e.target.value, 10))}
            className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {allSurahs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}. {s.nameSimple} — {s.nameTranslated}
              </option>
            ))}
          </select>

          {/* Tajweed toggle */}
          <button
            onClick={() => setTajweedMode((m) => !m)}
            title={tajweedMode ? "Hide Tajweed colors" : "Show Tajweed colors"}
            className={[
              "flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
              tajweedMode
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:bg-muted",
            ].join(" ")}
          >
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tajweed</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => prevId && navigate(prevId)}
              disabled={!prevId}
              title={prevSurah?.nameSimple}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-input text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => nextId && navigate(nextId)}
              disabled={!nextId}
              title={nextSurah?.nameSimple}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-input text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tajweed legend */}
        {tajweedMode && (
          <div className="border-t border-border bg-muted/50 px-4 py-2">
            <div className="mx-auto flex max-w-4xl flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="text-[#f59e0b] font-medium">? Qalqalah</span>
              <span className="text-[#22c55e] font-medium">? Ghunnah / Idgham</span>
              <span className="text-[#14b8a6] font-medium">? Ikhfa</span>
              <span className="text-[#f43f5e] font-medium">? Iqlab</span>
              <span className="text-[#3b82f6] font-medium">? Madd</span>
              <span className="text-[#9ca3af] font-medium">? Silent / Wasl</span>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-6">
        {/* Surah header */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Surah {surah.id} of 114
          </p>
          <h1
            className="mt-1 font-heading text-3xl text-primary"
            dir="rtl"
            lang="ar"
            style={{ fontFamily: "var(--font-arabic), serif" }}
          >
            {surah.nameArabic}
          </h1>
          <p className="mt-1 text-lg font-semibold">{surah.nameSimple}</p>
          <p className="text-sm text-muted-foreground">{surah.nameTranslated}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {surah.versesCount} verses
          </p>
          {isBismillahSurah && (
            <p
              className="mt-6 text-2xl leading-loose text-foreground/80"
              dir="rtl"
              lang="ar"
              style={{ fontFamily: "var(--font-arabic), serif" }}
            >
              ?????? ??????? ???????????? ??????????
            </p>
          )}
        </div>

        {/* Word detail panel — only visible in word-by-word mode */}
        {!tajweedMode && selectedWord && (
          <div className="sticky top-[65px] z-10 mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p
                  className="mb-1 text-3xl leading-loose text-foreground"
                  dir="rtl"
                  lang="ar"
                  style={{ fontFamily: "var(--font-arabic), serif" }}
                >
                  {selectedWord.text}
                </p>
                <p className="text-sm font-medium italic text-primary">
                  {selectedWord.transliteration}
                </p>
                <p className="mt-1 text-base text-foreground">
                  {selectedWord.translation}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Verse {selectedWord.verseKey}, word {selectedWord.position}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedWord.audioUrl && (
                  <button
                    onClick={() => playAudio(selectedWord.audioUrl)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:opacity-90"
                    title="Play pronunciation"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedWord(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-input text-muted-foreground hover:bg-muted"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verses */}
        <div className="space-y-6">
          {verses.map((verse) => (
            <div
              key={verse.id}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              {/* Verse number badge */}
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {verse.verseNumber}
                </span>
                <span className="text-xs text-muted-foreground">
                  {verse.verseKey}
                </span>
              </div>

              {tajweedMode ? (
                /* Tajweed mode: full colored verse text */
                <div
                  className="mb-4 text-right text-2xl leading-loose"
                  dir="rtl"
                  lang="ar"
                  style={{ fontFamily: "var(--font-arabic), serif" }}
                  dangerouslySetInnerHTML={{ __html: verse.tajweedHtml || verse.words.map((w) => w.text).join(" ") }}
                />
              ) : (
                /* Word-by-word mode: interactive clickable words */
                <div
                  className="mb-4 flex flex-wrap justify-end gap-x-1 gap-y-3"
                  dir="rtl"
                  lang="ar"
                >
                  {verse.words.map((word) => {
                    const isSelected = selectedWord?.id === word.id;
                    return (
                      <button
                        key={word.id}
                        onClick={() => handleWordClick(word, verse.verseKey)}
                        className={[
                          "group relative rounded px-2 py-1 text-right transition-colors",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted",
                        ].join(" ")}
                        title={word.translation}
                        style={{ fontFamily: "var(--font-arabic), serif" }}
                      >
                        <span className="block text-2xl leading-relaxed text-foreground group-hover:text-primary">
                          {word.text}
                        </span>
                        <span
                          className={[
                            "mt-0.5 block text-center text-[10px] leading-none",
                            isSelected
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground",
                          ].join(" ")}
                          dir="ltr"
                        >
                          {word.transliteration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* English translation */}
              <p className="border-t border-border/50 pt-3 text-sm leading-relaxed text-muted-foreground">
                {verse.translationText}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom navigation */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => prevId && navigate(prevId)}
            disabled={!prevId}
            className="flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            {prevSurah ? (
              <span>
                {prevSurah.nameSimple}
                <span className="hidden sm:inline">
                  {" "}
                  — {prevSurah.nameTranslated}
                </span>
              </span>
            ) : (
              "Previous"
            )}
          </button>

          <button
            onClick={() => nextId && navigate(nextId)}
            disabled={!nextId}
            className="flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nextSurah ? (
              <span>
                {nextSurah.nameSimple}
                <span className="hidden sm:inline">
                  {" "}
                  — {nextSurah.nameTranslated}
                </span>
              </span>
            ) : (
              "Next"
            )}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
