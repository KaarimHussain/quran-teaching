import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SURAHS, fetchSurahVerses } from "@/lib/quran";
import { QuranReader } from "./reader";

type Props = {
  params: Promise<{ surahId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { surahId } = await params;
  const id = parseInt(surahId, 10);
  const surah = SURAHS.find((s) => s.id === id);
  if (!surah) return { title: "Not Found" };
  return {
    title: `${surah.nameSimple} — ${surah.nameTranslated} | Quran Reader`,
  };
}

export default async function SurahPage({ params }: Props) {
  const { surahId } = await params;
  const id = parseInt(surahId, 10);

  if (!id || id < 1 || id > 114) notFound();

  const surah = SURAHS.find((s) => s.id === id);
  if (!surah) notFound();

  const [verses, cookieStore] = await Promise.all([fetchSurahVerses(id), cookies()]);
  const raw = cookieStore.get("locale")?.value;
  const language = raw === "UR" || raw === "AR" ? raw : "EN";

  return (
    <QuranReader
      surah={surah}
      verses={verses}
      allSurahs={SURAHS}
      language={language}
    />
  );
}
