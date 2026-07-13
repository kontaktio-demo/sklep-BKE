// Ostatnio ogladane. Na dysku leza wylacznie slugi - produkty odtwarza sie z katalogu,
// dokladnie jak w koszyku (lib/cart.tsx). Dzieki temu pozycja wycofana ze sprzedazy
// po prostu wypada z listy zamiast renderowac nieaktualna cene.

const STORAGE_KEY = "pakt-recent-v1";

/** Gorny limit historii. Rzad pokazuje mniej, ale zapas trzyma liste zywa,
 *  gdy czesc slugow zniknie z katalogu. */
export const MAX_RECENT = 8;

/** Nieznany ksztalt z localStorage: klucz mogla zapisac starsza wersja sklepu albo
 *  reka uzytkownika. Kazdy wpis przechodzi walidacje, duplikaty wypadaja. */
export function getRecent(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const slugs: string[] = [];
    for (const entry of parsed) {
      if (typeof entry !== "string" || entry.length === 0) continue;
      if (slugs.includes(entry)) continue;
      slugs.push(entry);
      if (slugs.length === MAX_RECENT) break;
    }
    return slugs;
  } catch {
    // wylaczone localStorage albo uszkodzony JSON: historia startuje pusta, nic nie wybucha
    return [];
  }
}

/** Dopisuje slug na czolo historii i zwraca nowa liste (najnowszy pierwszy, bez duplikatow).
 *  Wywolanie jest idempotentne, wiec podwojny efekt montujacy w trybie deweloperskim
 *  nie duplikuje wpisu. */
export function pushRecent(slug: string): string[] {
  if (typeof window === "undefined" || slug.length === 0) return [];

  const next = [slug, ...getRecent().filter((s) => s !== slug)].slice(0, MAX_RECENT);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // brak miejsca albo tryb prywatny: historia dziala do konca sesji, tylko nie przezyje odswiezenia
  }

  return next;
}
