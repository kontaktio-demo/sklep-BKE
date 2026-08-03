import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "./locale";

// Konfiguracja żądania dla next-intl (tryb bez routingu w URL — locale z cookie/nagłówka).
export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
