import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const localeMap: Record<string, string> = {
  EN: "en",
  UR: "ur",
  AR: "ar",
};

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value ?? "EN";
  const locale = localeMap[raw] ?? "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
