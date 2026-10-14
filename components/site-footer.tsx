import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { FooterLanguageLinks } from "@/components/footer-language-links";

type Language = "EN" | "UR" | "AR";

export async function SiteFooter() {
  const [cookieStore, t, nav] = await Promise.all([
    cookies(),
    getTranslations("marketing.footer"),
    getTranslations("marketing.header"),
  ]);
  const language = (cookieStore.get("locale")?.value as Language | undefined) ?? "EN";

  const columns = [
    {
      title: t("learnTitle"),
      links: [
        { href: "/courses", label: nav("courses") },
        { href: "/#how-it-works", label: nav("howItWorks") },
        { href: "/quran", label: nav("quranReader") },
      ],
    },
    {
      title: t("accountTitle"),
      links: [
        { href: "/register", label: nav("startFree") },
        { href: "/login", label: nav("login") },
        { href: "/register", label: t("volunteer") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BookOpenText className="size-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-xl text-primary">Quran Learning</span>
            </Link>
            <p className="text-base leading-relaxed text-muted-foreground">{t("tagline")}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <h2 className="font-sans text-base font-semibold text-foreground">{col.title}</h2>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-10 items-center text-base text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex flex-col gap-3">
              <h2 className="font-sans text-base font-semibold text-foreground">{t("languagesTitle")}</h2>
              <FooterLanguageLinks current={language} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-center text-base text-muted-foreground sm:flex-row sm:text-start">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
