"use client";

import Link from "next/link";
import { useReducer, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Surah, QuranVerse, QuranWord } from "@/lib/quran";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  BookOpen,
  Palette,
  ArrowLeft,
  Play,
  Pause,
  Languages,
  AudioWaveform,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  surah: Surah;
  verses: QuranVerse[];
  allSurahs: Surah[];
};

type AudioMode = "continuous" | "word-by-word" | "none";
type TranslationLang = "en" | "ur" | "ar";
type ViewFormat = "mushaf" | "cards";

type ReaderState = {
  currentPage: number;
  selectedWordId: number | null;
  highlightedWordId: number | null;
  verseProgress: number;
  tajweedMode: boolean;
  showTranslation: boolean;
  translationLang: TranslationLang;
  viewFormat: ViewFormat;
  pageDirection: "left" | "right" | "none";
  playingVerseKey: string | null;
  audioMode: AudioMode;
  isPlayingFullSurah: boolean;
  currentPlayingVerseNum: number | null;
};

type Action =
  | { type: "SET_PAGE"; page: number; direction: "left" | "right" | "none" }
  | { type: "SELECT_WORD"; wordId: number | null }
  | { type: "HIGHLIGHT_WORD"; wordId: number | null }
  | { type: "SET_VERSE_PROGRESS"; progress: number }
  | { type: "TOGGLE_TAJWEED" }
  | { type: "TOGGLE_TRANSLATION" }
  | { type: "SET_TRANSLATION_LANG"; lang: TranslationLang }
  | { type: "TOGGLE_VIEW_FORMAT" }
  | {
      type: "SET_AUDIO_PLAYING";
      verseKey: string | null;
      audioMode: AudioMode;
      isPlayingFullSurah: boolean;
      currentVerseNum: number | null;
    }
  | { type: "RESET_SURAH" };

function readerReducer(state: ReaderState, action: Action): ReaderState {
  switch (action.type) {
    case "SET_PAGE":
      return {
        ...state,
        currentPage: action.page,
        pageDirection: action.direction,
      };
    case "SELECT_WORD":
      return {
        ...state,
        selectedWordId: action.wordId,
      };
    case "HIGHLIGHT_WORD":
      return {
        ...state,
        highlightedWordId: action.wordId,
      };
    case "SET_VERSE_PROGRESS":
      return {
        ...state,
        verseProgress: action.progress,
      };
    case "TOGGLE_TAJWEED":
      return {
        ...state,
        tajweedMode: !state.tajweedMode,
      };
    case "TOGGLE_TRANSLATION":
      return {
        ...state,
        showTranslation: !state.showTranslation,
      };
    case "SET_TRANSLATION_LANG":
      return {
        ...state,
        translationLang: action.lang,
      };
    case "TOGGLE_VIEW_FORMAT":
      return {
        ...state,
        viewFormat: state.viewFormat === "cards" ? "mushaf" : "cards",
      };
    case "SET_AUDIO_PLAYING":
      return {
        ...state,
        playingVerseKey: action.verseKey,
        audioMode: action.audioMode,
        isPlayingFullSurah: action.isPlayingFullSurah,
        currentPlayingVerseNum: action.currentVerseNum,
        highlightedWordId: action.audioMode === "continuous" ? null : state.highlightedWordId,
        verseProgress: action.audioMode === "none" ? 0 : state.verseProgress,
      };
    case "RESET_SURAH":
      return {
        ...state,
        currentPage: 1,
        pageDirection: "none",
        playingVerseKey: null,
        selectedWordId: null,
        highlightedWordId: null,
        verseProgress: 0,
        audioMode: "none",
        isPlayingFullSurah: false,
        currentPlayingVerseNum: null,
      };
    default:
      return state;
  }
}

// Convert Western digits (1, 2, 3) to Eastern Arabic digits (۱, ۲, ۳) for authentic Mushaf symbols
function toArabicDigits(num: number): string {
  const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num)
    .split("")
    .map((d) => digits[parseInt(d, 10)] ?? d)
    .join("");
}

const VERSES_PER_PAGE = 6;

export function QuranReader({ surah, verses, allSurahs }: Props) {
  const router = useRouter();

  const [state, dispatch] = useReducer(readerReducer, {
    currentPage: 1,
    selectedWordId: null,
    highlightedWordId: null,
    verseProgress: 0,
    tajweedMode: false,
    showTranslation: true,
    translationLang: "en",
    viewFormat: "mushaf",
    pageDirection: "none",
    playingVerseKey: null,
    audioMode: "none",
    isPlayingFullSurah: false,
    currentPlayingVerseNum: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Flatten all words in the Surah into a sequential array for word-by-word audio playback
  const flatWordsList = useMemo(() => {
    const list: Array<{
      word: QuranWord;
      verseNum: number;
      verseKey: string;
      globalIndex: number;
    }> = [];
    let index = 0;
    verses.forEach((v) => {
      v.words.forEach((w) => {
        list.push({
          word: w,
          verseNum: v.verseNumber,
          verseKey: v.verseKey,
          globalIndex: index++,
        });
      });
    });
    return list;
  }, [verses]);

  // Pause active audio without clearing UI state
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  // Stop audio playback & clear word highlights completely
  const stopAudio = useCallback(() => {
    pauseAudio();
    dispatch({
      type: "SET_AUDIO_PLAYING",
      verseKey: null,
      audioMode: "none",
      isPlayingFullSurah: false,
      currentVerseNum: null,
    });
    dispatch({ type: "HIGHLIGHT_WORD", wordId: null });
    dispatch({ type: "SET_VERSE_PROGRESS", progress: 0 });
  }, [pauseAudio]);

  // Reset state when surah changes & cleanup audio on unmount
  useEffect(() => {
    stopAudio();
    dispatch({ type: "RESET_SURAH" });

    return () => {
      stopAudio();
    };
  }, [surah.id, stopAudio]);

  // ── Mode 1: Continuous Recitation (Alafasy Full Verse Audio without Word Highlights) ──
  const playContinuousRecitationFromVerse = useCallback(
    (verseNum: number, isFullSurah: boolean) => {
      if (verseNum > verses.length) {
        stopAudio();
        return;
      }

      const targetVerse = verses.find((v) => v.verseNumber === verseNum);
      if (!targetVerse) return;

      // Auto-flip page if target verse is on a different page
      const pageForVerse = Math.ceil(verseNum / VERSES_PER_PAGE);
      if (pageForVerse !== state.currentPage) {
        dispatch({
          type: "SET_PAGE",
          page: pageForVerse,
          direction: pageForVerse > state.currentPage ? "left" : "right",
        });
      }

      const paddedSurah = String(surah.id).padStart(3, "0");
      const paddedVerse = String(verseNum).padStart(3, "0");
      const url = `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedVerse}.mp3`;

      pauseAudio();

      const audio = new Audio(url);
      audioRef.current = audio;

      dispatch({
        type: "SET_AUDIO_PLAYING",
        verseKey: targetVerse.verseKey,
        audioMode: "continuous",
        isPlayingFullSurah: isFullSurah,
        currentVerseNum: verseNum,
      });
      dispatch({ type: "HIGHLIGHT_WORD", wordId: null });

      audio.ontimeupdate = () => {
        if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
          const progress = Math.min(1, Math.max(0, audio.currentTime / audio.duration));
          dispatch({ type: "SET_VERSE_PROGRESS", progress: progress * 100 });
        }
      };

      audio.play().catch(() => {
        stopAudio();
      });

      audio.onended = () => {
        dispatch({ type: "SET_VERSE_PROGRESS", progress: 0 });
        if (isFullSurah && verseNum < verses.length) {
          playContinuousRecitationFromVerse(verseNum + 1, true);
        } else {
          stopAudio();
        }
      };
    },
    [verses, surah.id, state.currentPage, pauseAudio, stopAudio]
  );

  // ── Mode 2: Word Sync Mode (Word-by-Word Sequential Audio with 100% Exact Character Highlight) ──
  const playWordSyncSequence = useCallback(
    (startIndex: number, maxIndex?: number, isFullSurah = false) => {
      const endLimit = maxIndex ?? flatWordsList.length;

      if (startIndex >= endLimit || startIndex >= flatWordsList.length) {
        stopAudio();
        return;
      }

      const item = flatWordsList[startIndex];

      // Auto-flip page if target verse is on a different page
      const pageForVerse = Math.ceil(item.verseNum / VERSES_PER_PAGE);
      if (pageForVerse !== state.currentPage) {
        dispatch({
          type: "SET_PAGE",
          page: pageForVerse,
          direction: pageForVerse > state.currentPage ? "left" : "right",
        });
      }

      dispatch({
        type: "SET_AUDIO_PLAYING",
        verseKey: item.verseKey,
        audioMode: "word-by-word",
        isPlayingFullSurah: isFullSurah,
        currentVerseNum: item.verseNum,
      });

      // Highlight current word
      dispatch({ type: "HIGHLIGHT_WORD", wordId: item.word.id });

      // If word has no audio URL, skip to next word
      if (!item.word.audioUrl) {
        playWordSyncSequence(startIndex + 1, endLimit, isFullSurah);
        return;
      }

      pauseAudio();

      const audio = new Audio(item.word.audioUrl);
      audioRef.current = audio;

      // Update progress within verse
      const verseWordItems = flatWordsList.filter((w) => w.verseKey === item.verseKey);
      const wordVersePos = verseWordItems.findIndex((w) => w.globalIndex === item.globalIndex);
      if (verseWordItems.length > 0) {
        const verseProgressPct = ((wordVersePos + 1) / verseWordItems.length) * 100;
        dispatch({ type: "SET_VERSE_PROGRESS", progress: verseProgressPct });
      }

      audio.play().catch(() => {
        playWordSyncSequence(startIndex + 1, endLimit, isFullSurah);
      });

      audio.onended = () => {
        playWordSyncSequence(startIndex + 1, endLimit, isFullSurah);
      };
    },
    [flatWordsList, state.currentPage, pauseAudio, stopAudio]
  );

  // Toggle Full Surah playback by mode
  const toggleFullSurahAudio = (mode: "continuous" | "word-by-word") => {
    if (state.isPlayingFullSurah && state.audioMode === mode) {
      stopAudio();
    } else {
      const startingVerseNum = state.currentPlayingVerseNum || (state.currentPage - 1) * VERSES_PER_PAGE + 1;
      if (mode === "continuous") {
        playContinuousRecitationFromVerse(startingVerseNum, true);
      } else {
        const startingWordItem = flatWordsList.find((w) => w.verseNum >= startingVerseNum);
        const startIdx = startingWordItem ? startingWordItem.globalIndex : 0;
        playWordSyncSequence(startIdx, flatWordsList.length, true);
      }
    }
  };

  // Toggle single verse playback by mode
  const toggleVerseAudio = (verse: QuranVerse, mode: "continuous" | "word-by-word") => {
    if (state.playingVerseKey === verse.verseKey && state.audioMode === mode && !state.isPlayingFullSurah) {
      stopAudio();
      return;
    }

    if (mode === "continuous") {
      playContinuousRecitationFromVerse(verse.verseNumber, false);
    } else {
      const firstWordOfVerse = flatWordsList.find((w) => w.verseKey === verse.verseKey);
      if (!firstWordOfVerse) return;

      const verseWordItems = flatWordsList.filter((w) => w.verseKey === verse.verseKey);
      const startIdx = firstWordOfVerse.globalIndex;
      const endIdx = startIdx + verseWordItems.length;

      playWordSyncSequence(startIdx, endIdx, false);
    }
  };

  // Play single word pronunciation on click
  const handleWordClick = (word: QuranWord) => {
    dispatch({ type: "SELECT_WORD", wordId: word.id });
    if (word.audioUrl) {
      pauseAudio();
      dispatch({ type: "HIGHLIGHT_WORD", wordId: word.id });

      const audio = new Audio(word.audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => {
        dispatch({ type: "HIGHLIGHT_WORD", wordId: null });
      };
    }
  };

  const totalPages = Math.max(1, Math.ceil(verses.length / VERSES_PER_PAGE));
  const startIndex = (state.currentPage - 1) * VERSES_PER_PAGE;
  const currentVerses = verses.slice(startIndex, startIndex + VERSES_PER_PAGE);

  // Right-to-Left Arabic Book Spread:
  // Right Page = Page 1 of spread (verses 1-3) -> Appears on RIGHT side of screen
  // Left Page = Page 2 of spread (verses 4-6) -> Appears on LEFT side of screen
  const rightPageVerses = currentVerses.slice(0, Math.ceil(VERSES_PER_PAGE / 2));
  const leftPageVerses = currentVerses.slice(Math.ceil(VERSES_PER_PAGE / 2));

  const prevSurah = surah.id > 1 ? allSurahs.find((s) => s.id === surah.id - 1) : null;
  const nextSurah = surah.id < 114 ? allSurahs.find((s) => s.id === surah.id + 1) : null;

  const isBismillahSurah = surah.id !== 1 && surah.id !== 9;

  const navigateToSurah = (id: number) => {
    stopAudio();
    router.push(`/quran/${id}`);
  };

  const handlePrevPage = () => {
    if (state.currentPage > 1) {
      dispatch({ type: "SET_PAGE", page: state.currentPage - 1, direction: "right" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (prevSurah) {
      navigateToSurah(prevSurah.id);
    }
  };

  const handleNextPage = () => {
    if (state.currentPage < totalPages) {
      dispatch({ type: "SET_PAGE", page: state.currentPage + 1, direction: "left" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (nextSurah) {
      navigateToSurah(nextSurah.id);
    }
  };

  // Render Ayah Completion Circle (Rosette) with smooth hover bridge for audio popup
  const renderAyahCircle = (verse: QuranVerse) => {
    const isPlayingThisVerse = state.playingVerseKey === verse.verseKey;

    return (
      <span key={`circle-${verse.id}`} className="inline-flex items-center justify-center align-middle mx-1.5 my-0.5">
        <span
          onClick={() => toggleVerseAudio(verse, "continuous")}
          className={`group/ayah relative inline-flex items-center justify-center size-7 sm:size-8 rounded-full border-2 transition-all cursor-pointer select-none ${
            isPlayingThisVerse
              ? "border-primary bg-primary text-primary-foreground shadow-md scale-110 animate-pulse"
              : "border-amber-700/40 bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:border-primary hover:bg-primary/20"
          }`}
          title={`Verse ${verse.verseNumber} - Click to play audio`}
        >
          {/* Inner Dashed Ring */}
          <span className="absolute inset-0.5 rounded-full border border-dashed border-amber-700/30 pointer-events-none" />
          <span className="font-arabic font-bold text-xs sm:text-sm z-10">
            {toArabicDigits(verse.verseNumber)}
          </span>

          {/* Audio Action Tooltip Menu on Hover with Invisible Mouse Bridge (before:h-3) */}
          <span className="pointer-events-auto absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/ayah:flex items-center gap-1.5 bg-popover text-popover-foreground px-2.5 py-1 rounded-full shadow-lg border border-border z-50 text-xs font-sans font-normal before:absolute before:-bottom-3 before:left-0 before:right-0 before:h-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVerseAudio(verse, "continuous");
              }}
              className="p-1 hover:bg-muted rounded-full text-primary transition-colors"
              title="Continuous Recitation"
            >
              <Volume2 className="size-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVerseAudio(verse, "word-by-word");
              }}
              className="p-1 hover:bg-muted rounded-full text-secondary-foreground transition-colors"
              title="Word Sync Mode"
            >
              <AudioWaveform className="size-3.5" />
            </button>
          </span>
        </span>
      </span>
    );
  };

  // Helper to render continuous Real Mushaf text block (Words wrap ONLY when space is full on width)
  const renderMushafPageText = (pageVerses: QuranVerse[]) => {
    return (
      <div className="flex flex-col justify-between h-full space-y-4">
        {/* 1. Continuous Flowing Arabic Text Block (Wraps ONLY on width overflow) */}
        <div
          className="text-right text-lg sm:text-xl lg:text-2xl leading-[2.3] sm:leading-[2.7] font-arabic tracking-normal text-foreground/95"
          dir="rtl"
          lang="ar"
          style={{ fontFamily: "var(--font-arabic), serif" }}
        >
          {pageVerses.map((verse) => (
            <span key={verse.id} className="inline">
              {state.tajweedMode ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      verse.tajweedHtml ||
                      verse.words.map((w) => w.text).join(" "),
                  }}
                />
              ) : (
                verse.words.map((word) => {
                  const isSelected = state.selectedWordId === word.id;
                  const isHighlighted = state.highlightedWordId === word.id;

                  return (
                    <span key={word.id} className="group relative inline">
                      {/* Word Tooltip */}
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-30 min-w-22.5 rounded-lg bg-popover text-popover-foreground px-2 py-1 text-xs shadow-md border border-border font-sans font-normal">
                        <span className="font-semibold text-primary">{word.transliteration}</span>
                        <span className="text-[10px] text-muted-foreground text-center line-clamp-2">
                          {word.translation}
                        </span>
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
                      </span>

                      <span
                        onClick={() => handleWordClick(word)}
                        className={`inline rounded-sm px-1 py-0.5 cursor-pointer transition-all duration-150 ${
                          isHighlighted
                            ? "bg-secondary text-secondary-foreground font-extrabold shadow-sm ring-2 ring-secondary/80 z-20"
                            : isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-primary/10"
                        }`}
                      >
                        {word.text}
                      </span>{" "}
                    </span>
                  );
                })
              )}

              {/* Ayah Completion Circle Rosette */}
              {renderAyahCircle(verse)}
            </span>
          ))}
        </div>

        {/* 2. Fancy Ornate Divider & Tarjuma Translation Section below */}
        {state.showTranslation && (
          <div className="mt-4 pt-3 border-t border-amber-900/20 dark:border-amber-100/20 relative">
            {/* Fancy Ornate Center Pattern on Divider Line */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#faf6ed] dark:bg-[#0e1410] px-2 text-amber-800/40 dark:text-amber-300/40 text-[9px]">
              ❖ ❖ ❖
            </div>

            {/* Verse Tarjuma List */}
            <div className="space-y-1.5 mt-1">
              {pageVerses.map((verse) => (
                <div key={`trans-${verse.id}`} className="text-xs leading-normal">
                  <p
                    className={`text-muted-foreground/90 font-medium ${
                      state.translationLang === "ur"
                        ? "text-right font-sans text-xs sm:text-sm leading-relaxed"
                        : state.translationLang === "ar"
                        ? "text-right font-arabic text-xs sm:text-sm leading-relaxed"
                        : "text-left font-sans text-[11px] sm:text-xs leading-normal"
                    }`}
                    dir={state.translationLang === "en" ? "ltr" : "rtl"}
                  >
                    <span className="font-bold text-primary/90 mr-1.5 ml-1.5">
                      [{verse.verseNumber}]
                    </span>
                    {state.translationLang === "ur"
                      ? verse.translationUr || verse.translationText
                      : state.translationLang === "ar"
                      ? verse.translationAr || verse.translationText
                      : verse.translationEn || verse.translationText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper to render verse inside card view
  const renderCardVerseContent = (verse: QuranVerse) => {
    const isPlayingThisVerse = state.playingVerseKey === verse.verseKey;

    return (
      <div
        key={verse.id}
        className={`group/card rounded-xl border p-4 sm:p-5 transition-all shadow-2xs ${
          isPlayingThisVerse
            ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md scale-[1.01]"
            : "border-border/80 bg-background/50 hover:border-primary/30"
        }`}
      >
        {/* Verse Top Bar */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {verse.verseNumber}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {verse.verseKey}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant={
                isPlayingThisVerse && state.audioMode === "continuous"
                  ? "default"
                  : "outline"
              }
              size="sm"
              className="h-8 rounded-full gap-1 px-2.5 text-[11px] font-medium"
              onClick={() => toggleVerseAudio(verse, "continuous")}
              title="Play Continuous Recitation (Alafasy)"
            >
              {isPlayingThisVerse && state.audioMode === "continuous" ? (
                <VolumeX className="size-3.5 text-primary-foreground animate-pulse" />
              ) : (
                <Volume2 className="size-3.5 text-muted-foreground" />
              )}
              <span>Recitation</span>
            </Button>

            <Button
              variant={
                isPlayingThisVerse && state.audioMode === "word-by-word"
                  ? "default"
                  : "secondary"
              }
              size="sm"
              className="h-8 rounded-full gap-1 px-2.5 text-[11px] font-medium"
              onClick={() => toggleVerseAudio(verse, "word-by-word")}
              title="Play Word Sync Mode (100% Exact Character Highlight)"
            >
              <AudioWaveform
                className={`size-3.5 ${
                  isPlayingThisVerse && state.audioMode === "word-by-word"
                    ? "text-primary-foreground animate-pulse"
                    : "text-secondary-foreground"
                }`}
              />
              <span>Word Sync</span>
            </Button>
          </div>
        </div>

        {/* Verse Body */}
        {state.tajweedMode ? (
          <div
            className={`relative rounded-lg p-3 transition-all ${
              isPlayingThisVerse
                ? "bg-primary/10 border border-primary/30 shadow-xs"
                : ""
            }`}
          >
            <div
              className="mb-2 text-right text-xl sm:text-2xl lg:text-3xl leading-loose"
              dir="rtl"
              lang="ar"
              style={{ fontFamily: "var(--font-arabic), serif" }}
              dangerouslySetInnerHTML={{
                __html:
                  verse.tajweedHtml ||
                  verse.words.map((w) => w.text).join(" "),
              }}
            />
            {isPlayingThisVerse && (
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-secondary transition-all duration-150"
                  style={{ width: `${state.verseProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            className="mb-4 flex flex-wrap justify-start text-right gap-x-1 gap-y-3"
            dir="rtl"
            lang="ar"
          >
            {verse.words.map((word) => {
              const isSelected = state.selectedWordId === word.id;
              const isHighlighted = state.highlightedWordId === word.id;

              return (
                <div key={word.id} className="group relative inline-block">
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 min-w-27.5 rounded-lg bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-md border border-border transition-all">
                    <span className="font-semibold text-primary">
                      {word.transliteration}
                    </span>
                    <span className="text-[11px] text-muted-foreground text-center line-clamp-2">
                      {word.translation}
                    </span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
                  </div>

                  <button
                    onClick={() => handleWordClick(word)}
                    className={`min-w-13 rounded-lg px-2.5 py-1 text-right transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isHighlighted
                        ? "bg-secondary text-secondary-foreground font-extrabold shadow-lg scale-110 ring-4 ring-secondary/80 -translate-y-1 z-20"
                        : isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                    style={{ fontFamily: "var(--font-arabic), serif" }}
                    title={`${word.transliteration} - ${word.translation}`}
                  >
                    <span className="block text-xl sm:text-2xl lg:text-3xl leading-relaxed">
                      {word.text}
                    </span>
                    <span
                      className={`block text-center text-[10px] leading-tight font-sans ${
                        isHighlighted
                          ? "text-secondary-foreground font-bold"
                          : isSelected
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground/70"
                      }`}
                      dir="ltr"
                    >
                      {word.transliteration}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {state.showTranslation && (
          <div className="border-t border-border/40 pt-3 mt-3">
            <p
              className={`text-xs sm:text-sm leading-relaxed text-foreground/90 transition-all ${
                state.translationLang === "ur"
                  ? "text-right font-sans font-medium text-base sm:text-lg leading-loose"
                  : state.translationLang === "ar"
                  ? "text-right font-arabic font-medium text-base sm:text-lg leading-loose"
                  : "font-sans font-medium"
              }`}
              dir={state.translationLang === "en" ? "ltr" : "rtl"}
              lang={state.translationLang}
            >
              {state.translationLang === "ur"
                ? verse.translationUr || verse.translationText
                : state.translationLang === "ar"
                ? verse.translationAr || verse.translationText
                : verse.translationEn || verse.translationText}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative pb-20">
      {/* Clean Original Smooth Page Turn Keyframe Styles */}
      <style jsx global>{`
        @keyframes pageTurnLeft {
          from {
            opacity: 0;
            transform: translateX(20px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes pageTurnRight {
          from {
            opacity: 0;
            transform: translateX(-20px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-turn-left {
          animation: pageTurnLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-turn-right {
          animation: pageTurnRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* ── Floating Action Button (FAB) for switching View Format ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => dispatch({ type: "TOGGLE_VIEW_FORMAT" })}
          size="lg"
          className="rounded-full shadow-2xl gap-2.5 px-5 py-6 bg-primary text-primary-foreground hover:scale-105 transition-all border-2 border-primary-foreground/20"
          title={
            state.viewFormat === "mushaf"
              ? "Switch to Card View"
              : "Switch to 2-Page Mushaf Book View"
          }
        >
          {state.viewFormat === "mushaf" ? (
            <>
              <LayoutGrid className="size-5" />
              <span className="font-semibold text-sm">Card View</span>
            </>
          ) : (
            <>
              <BookOpen className="size-5" />
              <span className="font-semibold text-sm">2-Page Book View</span>
            </>
          )}
        </Button>
      </div>

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-6 gap-2">
          {/* Left section: Back Button + Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Back to Dashboard"
              title="Back to Dashboard"
            >
              <Link href="/student" onClick={stopAudio}>
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="size-4" />
              </span>
              <span className="font-heading text-base sm:text-lg font-bold text-primary tracking-wide">
                Quran Reader
              </span>
            </div>
          </div>

          {/* Center section: Read-only Surah display (hidden on small mobile) */}
          <div className="hidden md:flex flex-col items-center justify-center text-center">
            <span
              className="font-heading text-lg font-bold text-foreground"
              dir="rtl"
              lang="ar"
              style={{ fontFamily: "var(--font-arabic), serif" }}
            >
              {surah.nameArabic}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Surah {surah.id} &middot; {surah.nameSimple} ({surah.nameTranslated})
            </span>
          </div>

          {/* Right section: Select dropdown, Tajweed toggle, Theme toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Surah Dropdown */}
            <select
              value={surah.id}
              onChange={(e) => navigateToSurah(parseInt(e.target.value, 10))}
              className="h-9 max-w-27.5 sm:max-w-45 md:max-w-50 truncate rounded-full border border-input bg-background px-3 py-1 text-xs sm:text-sm font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {allSurahs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. {s.nameSimple}
                </option>
              ))}
            </select>

            {/* Tajweed Toggle */}
            <Button
              variant={state.tajweedMode ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch({ type: "TOGGLE_TAJWEED" })}
              className="rounded-full gap-1.5 px-3 text-xs font-semibold"
              title={state.tajweedMode ? "Disable Tajweed rules" : "Enable Tajweed rules"}
            >
              <Palette className="size-3.5" />
              <span className="hidden sm:inline">Tajweed</span>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Tajweed Legend Bar (Visible when Tajweed Mode is active) */}
        {state.tajweedMode && (
          <div className="border-t border-border bg-muted/60 px-4 py-2 text-xs">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-muted-foreground font-medium">
              <span className="text-[#f59e0b]">&#9679; Qalqalah</span>
              <span className="text-[#22c55e]">&#9679; Ghunnah / Idgham</span>
              <span className="text-[#14b8a6]">&#9679; Ikhfa</span>
              <span className="text-[#f43f5e]">&#9679; Iqlab</span>
              <span className="text-[#3b82f6]">&#9679; Madd</span>
              <span className="text-[#9ca3af]">&#9679; Silent / Wasl</span>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Reader Area ── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-3 sm:px-6 py-5 sm:py-6 flex flex-col justify-start gap-5">
        {/* Surah Header Block */}
        <div className="mb-1 sm:mb-2 text-center flex flex-col items-center gap-1.5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Surah {surah.id} of 114 &middot; {surah.versesCount} Verses
          </span>
          <h1
            className="font-heading text-3xl sm:text-4xl text-primary font-bold mt-0.5"
            dir="rtl"
            lang="ar"
            style={{ fontFamily: "var(--font-arabic), serif" }}
          >
            {surah.nameArabic}
          </h1>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">{surah.nameSimple}</h2>
          <p className="text-xs text-muted-foreground">{surah.nameTranslated}</p>

          {/* ── Top Control Bar: Audio Options + 3-Language Translation Switcher ── */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 bg-card/60 backdrop-blur-xs p-1.5 rounded-2xl border border-border/60 shadow-xs">
            {/* 1st Audio Option: Continuous Recitation (Alafasy) */}
            <Button
              variant={
                state.isPlayingFullSurah && state.audioMode === "continuous"
                  ? "default"
                  : "secondary"
              }
              size="sm"
              onClick={() => toggleFullSurahAudio("continuous")}
              className="rounded-full gap-2 px-3.5 h-8 font-semibold text-xs shadow-xs"
              title="Play continuous Tajweed recitation (Alafasy)"
            >
              {state.isPlayingFullSurah && state.audioMode === "continuous" ? (
                <>
                  <Pause className="size-3.5 fill-current animate-pulse" />
                  <span>Pause Recitation</span>
                </>
              ) : (
                <>
                  <Play className="size-3.5 fill-current text-primary" />
                  <span>Continuous Recitation</span>
                </>
              )}
            </Button>

            {/* 2nd Audio Option: Word Sync Mode */}
            <Button
              variant={
                state.isPlayingFullSurah && state.audioMode === "word-by-word"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => toggleFullSurahAudio("word-by-word")}
              className="rounded-full gap-2 px-3.5 h-8 font-semibold text-xs shadow-xs border-primary/30"
              title="Play word-by-word recitation with 100% exact character highlighting"
            >
              {state.isPlayingFullSurah && state.audioMode === "word-by-word" ? (
                <>
                  <Pause className="size-3.5 fill-current animate-pulse" />
                  <span>Pause Word Sync</span>
                </>
              ) : (
                <>
                  <AudioWaveform className="size-3.5 text-primary" />
                  <span>Word Sync Mode</span>
                </>
              )}
            </Button>

            {/* Tarjuma Toggle */}
            <Button
              variant={state.showTranslation ? "outline" : "ghost"}
              size="sm"
              onClick={() => dispatch({ type: "TOGGLE_TRANSLATION" })}
              className="rounded-full gap-1.5 px-3 h-8 text-xs font-medium"
              title={
                state.showTranslation
                  ? "Hide Translation (Tarjuma)"
                  : "Show Translation (Tarjuma)"
              }
            >
              <Languages className="size-3.5" />
              <span>{state.showTranslation ? "Hide Tarjuma" : "Show Tarjuma"}</span>
            </Button>

            {/* 3-Language Selector Pills: English, Urdu, Arabic */}
            {state.showTranslation && (
              <div className="flex items-center gap-1 bg-muted/80 p-0.5 rounded-full border border-border/60">
                <button
                  onClick={() => dispatch({ type: "SET_TRANSLATION_LANG", lang: "en" })}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                    state.translationLang === "en"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="English Translation"
                >
                  English
                </button>
                <button
                  onClick={() => dispatch({ type: "SET_TRANSLATION_LANG", lang: "ur" })}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                    state.translationLang === "ur"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Urdu Translation"
                >
                  اردو
                </button>
                <button
                  onClick={() => dispatch({ type: "SET_TRANSLATION_LANG", lang: "ar" })}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                    state.translationLang === "ar"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Arabic Tafseer / Explanation"
                >
                  العربية
                </button>
              </div>
            )}
          </div>

          {/* Page / Spread Indicator sit right below the options button container */}
          <div className="mt-1 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 shadow-2xs">
              {state.viewFormat === "mushaf"
                ? `Spread ${state.currentPage} of ${totalPages}`
                : `Page ${state.currentPage} of ${totalPages}`}
            </span>
          </div>

          {/* Bismillah */}
          {isBismillahSurah && state.currentPage === 1 && (
            <div className="mt-3 pt-3 border-t border-border/40 w-full">
              <p
                className="text-2xl sm:text-3xl leading-relaxed text-foreground/90 font-arabic"
                dir="rtl"
                lang="ar"
                style={{ fontFamily: "var(--font-arabic), serif" }}
              >
                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}
        </div>

        {/* ── CONDITIONAL FORMAT 1: Authentic 2-Page Fancy Light Mushaf Book Layout ── */}
        {state.viewFormat === "mushaf" ? (
          <div className="relative rounded-xl p-3.5 sm:p-5 lg:p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] transition-all bg-linear-to-b from-[#f8f4eb] via-[#f5efe2] to-[#eee6d5] dark:from-[#151c17] dark:via-[#111713] dark:to-[#0c110d] border-2 border-amber-800/35 dark:border-amber-600/40">
            {/* Dual Inner Gold Trim */}
            <div className="absolute inset-1 rounded-lg border border-amber-700/25 dark:border-amber-500/25 pointer-events-none" />
            <div className="absolute inset-2 rounded-md border border-dashed border-amber-600/15 pointer-events-none" />

            {/* Ornate Gold Corner Filigree Accents */}
            <div className="absolute top-3 left-3 size-4 border-t-2 border-l-2 border-amber-700/60 dark:border-amber-400/60 pointer-events-none" />
            <div className="absolute top-3 right-3 size-4 border-t-2 border-r-2 border-amber-700/60 dark:border-amber-400/60 pointer-events-none" />
            <div className="absolute bottom-3 left-3 size-4 border-b-2 border-l-2 border-amber-700/60 dark:border-amber-400/60 pointer-events-none" />
            <div className="absolute bottom-3 right-3 size-4 border-b-2 border-r-2 border-amber-700/60 dark:border-amber-400/60 pointer-events-none" />

            {/* Center Satin Ribbon Bookmark Accent */}
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-16 bg-linear-to-b from-amber-600 via-amber-700 to-amber-800 shadow-md rounded-b-xs z-20 pointer-events-none border-x border-amber-900/30">
              <div className="w-full h-1 bg-amber-400/60 mt-1" />
            </div>

            {/* Subtle 3D Stacked Page Thickness Layers on Edges */}
            <div className="absolute top-3 bottom-3 left-1 w-1.5 bg-linear-to-r from-amber-400/30 via-amber-300/10 to-transparent dark:from-amber-800/30 rounded-l-xs pointer-events-none" />
            <div className="absolute top-3 bottom-3 right-1 w-1.5 bg-linear-to-l from-amber-400/30 via-amber-300/10 to-transparent dark:from-amber-800/30 rounded-r-xs pointer-events-none" />

            {/* Center Spine Crease */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-7 bg-linear-to-r from-black/5 via-black/15 to-black/5 dark:from-black/20 dark:via-black/40 dark:to-black/20 pointer-events-none z-10 border-x border-amber-800/15" />

            {/* Authentic 2-Page Spread Layout with Original Smooth Transition:
                LEFT COLUMN ON SCREEN = Left Page (Page 2 of spread: Verses 4-6)
                RIGHT COLUMN ON SCREEN = Right Page (Page 1 of spread: Verses 1-3: Bismillah starts here!) */}
            <div
              key={`mushaf-${surah.id}-${state.currentPage}`}
              className={
                state.pageDirection === "left"
                  ? "animate-turn-left grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative z-0"
                  : state.pageDirection === "right"
                  ? "animate-turn-right grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative z-0"
                  : "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative z-0"
              }
            >
              {/* ── LEFT COLUMN ON SCREEN = Left Page (Page 2 of spread: Verses 4-6) ── */}
              <div className="flex flex-col justify-between border border-amber-800/20 dark:border-amber-600/20 rounded-xl p-3.5 sm:p-5 bg-[#fefcf6] dark:bg-[#0e1410] shadow-sm relative overflow-hidden">
                {/* Gold Inner Margin Frame */}
                <div className="absolute inset-1 rounded-lg border border-amber-700/10 pointer-events-none" />

                {/* Traditional Ornate Header Banner */}
                <div className="text-center pb-2 border-b border-amber-900/15 dark:border-amber-600/15 mb-3 flex items-center justify-between relative z-10">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                    الجزء {toArabicDigits(Math.ceil(surah.id / 4))}
                  </span>
                  <span className="font-arabic font-bold text-base text-primary drop-shadow-xs" dir="rtl">
                    سورة {surah.nameArabic}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                    صفحة {toArabicDigits(state.currentPage * 2)}
                  </span>
                </div>

                {/* Left Page Continuous Mushaf Text (Verses 4-6) */}
                <div className="flex-1 relative z-10">
                  {leftPageVerses.length > 0 ? (
                    renderMushafPageText(leftPageVerses)
                  ) : (
                    <div className="h-full min-h-40 flex items-center justify-center text-muted-foreground/50 text-xs italic font-serif">
                      End of Surah
                    </div>
                  )}
                </div>

                {/* Traditional Bottom Page Number Badge */}
                <div className="mt-4 pt-2 border-t border-amber-900/15 dark:border-amber-600/15 text-center relative z-10">
                  <span className="inline-block px-3 py-0.5 rounded-full border border-amber-800/30 bg-amber-100/60 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-xs font-arabic font-bold shadow-xs">
                    {toArabicDigits(state.currentPage * 2)}
                  </span>
                </div>
              </div>

              {/* ── RIGHT COLUMN ON SCREEN = Right Page (Page 1 of spread: Verses 1-3: Bismillah starts here!) ── */}
              <div className="flex flex-col justify-between border border-amber-800/20 dark:border-amber-600/20 rounded-xl p-3.5 sm:p-5 bg-[#fefcf6] dark:bg-[#0e1410] shadow-sm relative overflow-hidden">
                {/* Gold Inner Margin Frame */}
                <div className="absolute inset-1 rounded-lg border border-amber-700/10 pointer-events-none" />

                {/* Traditional Ornate Header Banner */}
                <div className="text-center pb-2 border-b border-amber-900/15 dark:border-amber-600/15 mb-3 flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                    صفحة {toArabicDigits(state.currentPage * 2 - 1)}
                  </span>
                  <span className="font-arabic font-bold text-base text-primary drop-shadow-xs" dir="rtl">
                    سورة {surah.nameArabic}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                    الجزء {toArabicDigits(Math.ceil(surah.id / 4))}
                  </span>
                </div>

                {/* Right Page Continuous Mushaf Text (Verses 1-3) */}
                <div className="flex-1 relative z-10">
                  {renderMushafPageText(rightPageVerses)}
                </div>

                {/* Traditional Bottom Page Number Badge */}
                <div className="mt-4 pt-2 border-t border-amber-900/15 dark:border-amber-600/15 text-center relative z-10">
                  <span className="inline-block px-3 py-0.5 rounded-full border border-amber-800/30 bg-amber-100/60 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-xs font-arabic font-bold shadow-xs">
                    {toArabicDigits(state.currentPage * 2 - 1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Page Navigation Controls */}
            <div className="mt-5 flex items-center justify-between border-t border-amber-800/20 dark:border-amber-500/20 pt-3 relative z-20">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={state.currentPage === 1 && !prevSurah}
                className="min-h-10 rounded-xl gap-2 font-medium px-4 text-xs bg-background/80 hover:bg-muted"
              >
                <ChevronLeft className="size-4" />
                {state.currentPage > 1
                  ? "Previous Spread"
                  : prevSurah
                  ? `Previous Surah (${prevSurah.nameSimple})`
                  : "Previous"}
              </Button>

              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={state.currentPage === totalPages && !nextSurah}
                className="min-h-10 rounded-xl gap-2 font-medium px-4 text-xs bg-background/80 hover:bg-muted"
              >
                {state.currentPage < totalPages
                  ? "Next Spread"
                  : nextSurah
                  ? `Next Surah (${nextSurah.nameSimple})`
                  : "Next"}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* ── CONDITIONAL FORMAT 2: Card-Based View ── */
          <div className="relative rounded-2xl border border-border/80 bg-card p-4 sm:p-6 md:p-8 shadow-md md:border-l-4 md:border-l-accent/40 md:shadow-[inset_14px_0_20px_-12px_rgba(0,0,0,0.05)] transition-all max-w-4xl mx-auto w-full">
            <div
              key={`${surah.id}-${state.currentPage}`}
              className={
                state.pageDirection === "left"
                  ? "animate-turn-left space-y-6"
                  : state.pageDirection === "right"
                  ? "animate-turn-right space-y-6"
                  : "space-y-6"
              }
            >
              {currentVerses.map((verse) => renderCardVerseContent(verse))}
            </div>

            {/* Page Navigation Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={state.currentPage === 1 && !prevSurah}
                className="min-h-11 rounded-xl gap-2 font-medium px-5"
              >
                <ChevronLeft className="size-4" />
                {state.currentPage > 1
                  ? "Previous Page"
                  : prevSurah
                  ? `Previous Surah (${prevSurah.nameSimple})`
                  : "Previous"}
              </Button>

              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={state.currentPage === totalPages && !nextSurah}
                className="min-h-11 rounded-xl gap-2 font-medium px-5"
              >
                {state.currentPage < totalPages
                  ? "Next Page"
                  : nextSurah
                  ? `Next Surah (${nextSurah.nameSimple})`
                  : "Next"}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
