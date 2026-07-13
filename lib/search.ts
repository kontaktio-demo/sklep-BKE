import { SIZE_LABEL, WIDTH_LABEL } from "./sizes";
import type { CollarCategory, CollarType, K9Category, Product } from "./types";

// Wyszukiwarka. Czysta funkcja nad tablica produktow - to samo wejscie daje to samo
// wyjscie, wiec wynik liczy sie na serwerze (/szukaj) i nie wymaga zadnego stanu.
// Dopasowanie idzie po nazwie, tagline, SKU, kategorii, kolorach i wartosciach specyfikacji.

/** Popularne frazy: jedno zrodlo dla panelu w naglowku i dla pustego wyniku na /szukaj. */
export const POPULAR_SEARCHES = [
  "Obroża robocza",
  "Panel ID",
  "Łańcuszkowa",
  "E-obroża",
  "Uchwyt",
] as const;

/** Adres wynikow. Fraza idzie do query, nigdy do sciezki. */
export function searchHref(query: string): string {
  return `/szukaj?q=${encodeURIComponent(query)}`;
}

/**
 * Skladanie tekstu do postaci porownywalnej: male litery, bez polskich znakow.
 * Dzieki temu "obroza" trafia w "Obroża", a "lancuszkowa" w "Łańcuszkowa".
 * NFD rozbija litere z diakrytykiem na litere + znak laczacy, ktory usuwamy;
 * "ł" nie ma rozkladu NFD, wiec idzie osobnym podstawieniem.
 */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l");
}

/**
 * Slowa do porownania. Separatorem jest wszystko poza litera i cyfra, wiec SKU
 * "PAKT-RAN-175-L" rozpada sie tak samo, jak wpisane zapytanie - i dlatego oba pasuja.
 */
function words(text: string): string[] {
  return fold(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// Tolerancja na polska fleksje. Zapytanie "lancuszkowa" ma trafic w etykiete
// "Łańcuszkowe", a "panele" w "panel", ale "szary" nie moze trafic w "szablon".
const EXACT_MAX = 2; // "id", "k9", "e" - za krotkie na cokolwiek poza rownoscia
const STEM_MIN = 6; // ponizej tej dlugosci liczy sie tylko fragment slowa
const STEM_SLACK = 2; // tyle znakow moze roznic sie koncowka
const STEM_FLOOR = 5; // ...ale wspolny prefiks nigdy nie schodzi ponizej 5 znakow

function commonPrefix(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i += 1;
  return i;
}

function hits(haystack: string[], token: string): boolean {
  if (token.length <= EXACT_MAX) return haystack.includes(token);
  return haystack.some((word) => {
    if (word.includes(token)) return true;
    if (token.length < STEM_MIN) return false;
    return commonPrefix(word, token) >= Math.max(STEM_FLOOR, token.length - STEM_SLACK);
  });
}

// Fasety maja w danych wartosci techniczne ("working", "chain"), a klient wpisuje polskie
// slowa. Ponizsze slowniki sa wylacznie dla wyszukiwarki - etykiety widoczne w interfejsie
// zostaja w lib/data/filters.mock i lib/sizes.
const CATEGORY_TEXT: Record<CollarCategory, string> = {
  working: "robocza robocze praca",
  "non-working": "codzienna codzienne spacerowa",
  "e-collar": "e-obroża kompatybilna z e-obrożą",
};

const TYPE_TEXT: Record<CollarType, string> = {
  nylon: "nylonowa nylonowe nylon taśma",
  chain: "łańcuszkowa łańcuszkowe łańcuszek stal",
};

const K9_TEXT: Record<K9Category, string> = {
  patrol: "patrolowa patrol",
  handle: "z uchwytem uchwyt interwencja",
  "e-collar": "pod moduł e-obroża",
  training: "szkoleniowa szkolenie trening",
  detection: "węchowa praca węchowa detekcja tropienie",
};

/**
 * Reszta pol produktu zwinieta w jeden tekst. Indeksujemy WARTOSCI specyfikacji, nie etykiety:
 * kazdy produkt ma wiersz o etykiecie "Panel ID" (z wartoscia "Brak" albo "Tak, rzep..."),
 * wiec indeksowanie etykiet sprawiloby, ze fraza "panel ID" pasuje do calego katalogu.
 */
function facetText(product: Product): string {
  return [
    CATEGORY_TEXT[product.category],
    TYPE_TEXT[product.type],
    product.k9Category ? K9_TEXT[product.k9Category] : "",
    product.line === "k9" ? "PAKT-K9 sprzęt służbowy" : "",
    product.idPanelCompatible ? "panel ID" : "",
    product.k9Standard ?? "",
    product.productType,
    SIZE_LABEL[product.size],
    WIDTH_LABEL[product.width],
    ...product.colors.map((color) => color.name),
    ...product.specs.map((spec) => spec.value),
  ].join(" ");
}

// Ranga pola = jakosc trafienia. Nazwa bije tagline, tagline bije SKU, SKU bije reszte.
const FIELD_RANK = [0, 10, 20, 30];

// Trafienie cala fraza w nazwe ("obroża robocza") wyprzedza produkt, ktory zebral
// te same slowa z roznych pol.
const PHRASE_BONUS = 5;

function fields(product: Product): string[][] {
  return [
    words(product.name),
    words(product.tagline),
    words(product.sku),
    words(facetText(product)),
  ];
}

/**
 * Zwraca produkty pasujace do frazy, posortowane od najlepszego trafienia.
 * Kazde slowo zapytania musi trafic w ktores pole (AND miedzy slowami, OR miedzy polami) -
 * dzieki temu "obroża robocza" nie wyrzuca calego katalogu tylko dlatego, ze wszystko
 * nazywa sie "obroża".
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const tokens = words(query);
  if (tokens.length === 0) return [];

  const phrase = tokens.join(" ");
  const matches: { product: Product; score: number }[] = [];

  for (const product of products) {
    const haystacks = fields(product);
    let score = 0;
    let matched = true;

    for (const token of tokens) {
      const rank = haystacks.findIndex((haystack) => hits(haystack, token));
      if (rank === -1) {
        matched = false;
        break;
      }
      score += FIELD_RANK[rank];
    }

    if (!matched) continue;

    // srednia, nie suma: dluzsze zapytanie nie moze podbijac wyniku samo z siebie
    score /= tokens.length;
    if (haystacks[0].join(" ").includes(phrase)) score -= PHRASE_BONUS;

    matches.push({ product, score });
  }

  return matches
    .sort(
      (a, b) =>
        a.score - b.score ||
        (a.product.bestsellerRank ?? Number.MAX_SAFE_INTEGER) -
          (b.product.bestsellerRank ?? Number.MAX_SAFE_INTEGER) ||
        a.product.name.localeCompare(b.product.name, "pl")
    )
    .map((match) => match.product);
}
