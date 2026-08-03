// Dwa języki sklepu: polski (domyślny) i angielski. Panel i PWA zostają po polsku.
// Locale trzymamy w cookie (bez prefiksu w URL), żeby nie ruszać struktury tras ani
// warstwy designu/motion współdzielonej z panelem.
export const locales = ["pl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pl";
export const LOCALE_COOKIE = "DOGSTORE_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export const localeLabels: Record<Locale, string> = {
  pl: "Polski",
  en: "English",
};
