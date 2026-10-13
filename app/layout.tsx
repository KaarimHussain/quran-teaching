import type { Metadata } from "next";
import { Amiri, Cinzel_Decorative, Montserrat, Noto_Nastaliq_Urdu, Scheherazade_New } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TawkToChat } from "@/components/tawkto-chat";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-heading",
  display: "swap",
});

// The Arabic-script fonts below are large and only used conditionally (Amiri in
// the Quran reader, Nastaliq for the Urdu locale, Scheherazade for the Arabic
// locale). `preload: false` keeps them out of every page's <link rel=preload>
// set; the browser fetches them lazily only when a glyph actually uses them.
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-nastaliq",
  display: "swap",
  preload: false,
});

const scheherazadeNew = Scheherazade_New({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic-ui",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Quran Learning",
  description: "A peaceful place to pray, learn, and belong",
};

const rtlLocales = new Set(["UR", "AR"]);

// Only these namespaces are read by client components (useTranslations); server
// components use getTranslations and don't need the catalog serialized into HTML.
type Messages = Record<string, unknown>;
function pickClientMessages(messages: Messages): Messages {
  const pages = (messages.pages ?? {}) as Messages;
  const admin = (pages.admin ?? {}) as Messages;
  return {
    nav: messages.nav,
    auth: messages.auth,
    common: messages.common,
    pages: {
      publicStore: pages.publicStore,
      admin: { store: admin.store },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  const locale = cookieStore.get("locale")?.value ?? "EN";

  const isDark = theme === "dark";
  const isRtl = rtlLocales.has(locale);

  const messages = pickClientMessages(await getMessages());

  return (
    <html
      lang={locale.toLowerCase()}
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "h-full",
        "antialiased",
        montserrat.variable,
        cinzelDecorative.variable,
        amiri.variable,
        notoNastaliqUrdu.variable,
        scheherazadeNew.variable,
        "font-sans",
        isDark && "dark"
      )}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <TawkToChat />
      </body>
    </html>
  );
}
