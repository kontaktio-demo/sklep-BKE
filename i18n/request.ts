import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "./locale";

// Słowniki dzielone na pliki-namespace (messages/<locale>/<ns>.json). Każdy plik wnosi
// własne klucze najwyższego poziomu; scalamy je płasko. Dzięki temu tłumaczenie kolejnych
// sekcji nie powoduje konfliktów w jednym wielkim pliku.
const NAMESPACES = [
  "common",
  "nav",
  "home",
  "product",
  "catalog",
  "cart",
  "checkout",
  "account",
  "newsletter",
  "cookies",
  "infoPages",
  "infoLegal",
  "pro",
  "misc",
  "emails",
  "reviews",
  "tracking",
] as const;

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  const parts = await Promise.all(
    NAMESPACES.map((ns) => import(`../messages/${locale}/${ns}.json`).then((m) => m.default)),
  );
  return {
    locale,
    messages: Object.assign({}, ...parts),
  };
});
