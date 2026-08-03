import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

/**
 * Źródło języka (priorytet):
 *  1. nagłówek `x-dogstore-locale` — ustawia go middleware na podstawie prefiksu URL /en,
 *  2. cookie wyboru użytkownika,
 *  3. domyślny (pl).
 * Czytane wyłącznie po stronie serwera (request config, komponenty serwerowe).
 */
export async function getUserLocale(): Promise<Locale> {
  // Poza kontekstem żądania (build-time: generateStaticParams / prerender) headers()/cookies()
  // rzucają — wtedy spadamy na język domyślny. W żądaniu czytamy nagłówek /en, potem cookie.
  try {
    const fromHeader = (await headers()).get("x-dogstore-locale");
    if (isLocale(fromHeader)) return fromHeader;
    const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
    return isLocale(fromCookie) ? fromCookie : defaultLocale;
  } catch {
    return defaultLocale;
  }
}
