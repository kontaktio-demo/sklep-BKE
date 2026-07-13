# PAKT - sklep z obrożami (frontend, bez backendu)

Polskojęzyczny sklep dla marki sprzętu dla psów pracujących. Dwa światy:

- **`/`** - jasna, neutralna strona główna (papier i tusz). Prowadzi do dwóch wejść.
- **Sklep cywilny** - `/collections/collars` (26 modeli), karty produktów, filtry, koszyk.
- **`PAKT-K9`** - `/k9` - ciemna, techniczna sekcja sprzętu służbowego: własne kategorie,
  własne 12 modeli (niedostępnych w zwykłym sklepie), katalog i zapytanie ofertowe.

Ceny w PLN, formatowanie `pl-PL`. Backendu nie ma: formularze nie udają wysyłki, tylko
przygotowują treść i otwierają program pocztowy. Koszyk żyje w `localStorage`.

## Uruchomienie

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build produkcyjny + sprawdzenie typów
```

Node 20+, pnpm. Stack: Next.js 15 (App Router, RSC, TS strict), Tailwind CSS v4
(tokeny `@theme` w `app/globals.css`), GSAP + ScrollTrigger, Lenis.

## Warstwa danych (seam) - CZYTAJ PRZED INTEGRACJĄ SUPABASE

**Cały interfejs czyta dane przez jeden plik: [`lib/data/index.ts`](./lib/data/index.ts).**
Nic poza `lib/data/` nie importuje plików `*.mock.ts`. Żeby wejść na backend, wystarczy
podmienić ciała funkcji - sygnatury zostają:

```ts
getCollection(handle): Promise<Collection>
getProducts(handle): Promise<Product[]>          // tylko linia "shop"
getFilters(handle): Promise<FilterGroup[]>
getProduct(slug): Promise<Product | null>        // null -> notFound()
getProductSlugs(): Promise<string[]>             // generateStaticParams
getRelatedProducts(slug, limit?): Promise<Product[]>   // nie miesza linii shop i k9
getK9Categories(): Promise<K9CategoryInfo[]>
getK9Category(slug): Promise<K9CategoryInfo | null>
getK9Products(category?): Promise<Product[]>
```

### Kontrakt danych ([`lib/types.ts`](./lib/types.ts))

**Rozmiar jest wariantem, nie atrybutem produktu.** To najważniejsza rzecz w tym modelu:

```ts
interface ProductVariant {
  size: "small" | "medium" | "large";
  sku: string;          // SKU modelu + kod rozmiaru, np. PAKT-RAN-175-M
  price: number;        // pełne PLN, cena TEGO rozmiaru
  inStock: boolean;     // dostępność TEGO rozmiaru
  neck: string;         // obwód szyi, np. "38-46 cm"
  weightGrams: number;
}
```

`Product` niesie:

- `variants: ProductVariant[]` (min. 2, posortowane od najmniejszego) oraz `sizes: CollarSize[]`
- `price` = **cena OD** (najniższa z wariantów), `fromPrice` = ceny wariantów się różnią
- `inStock` = **choć jeden** wariant dostępny; `sku` = SKU modelu bez kodu rozmiaru
- `specs` = cechy wspólne modelu. Obwód szyi i waga **nie są** w `specs`, bo zależą od rozmiaru
- `line: "shop" | "k9"` - sprzęt K9 nie może trafić do zwykłego sklepu
- dla K9 dodatkowo: `k9Category`, `k9Standard`

Zasady dla backendu:

- do koszyka zawsze idzie **cena i SKU wariantu**, nigdy `Product.price` (to cena OD)
- plakietka `sold-out` musi zgadzać się z dostępnością wariantów (mocki mają na to twardy
  guard, który rzuca wyjątkiem przy imporcie - warto zachować tę regułę po stronie bazy)
- liczniki faset (`FilterGroup.options[].count`) mają być liczone z danych, nie wpisywane ręcznie

Filtrowanie i sortowanie to czyste funkcje w [`lib/filtering.ts`](./lib/filtering.ts) i działają
bez zmian, dopóki seam zwraca powyższe kształty. Stan filtrów żyje w URL
(`?kategoria=working&rodzaj=nylon&sort=price-asc`), więc listę da się linkować.

## Gdzie co leży

```
app/page.tsx                    strona główna (jasna): hero, sekcja "jak pracujemy", dwa wejścia
app/collections/[handle]/       sklep cywilny (filtry w URL, SSR z produktami)
app/products/[slug]/            karta produktu (38 sztuk: 26 sklep + 12 K9)
app/k9/                         PAKT-K9: strona sekcji, kategorie, katalog, zapytanie ofertowe
app/koszyk/                     koszyk (persystencja, zamówienie mailem)
app/szukaj/                     wyszukiwarka (nazwa, SKU, specyfikacja, kolory)
app/(info)/                     kontakt, dostawa, zwroty, gwarancja, rozmiary, regulamin,
                                polityka prywatności, o nas
components/home/                hero, intro, dwa wejścia (SeamTransition)
components/k9/                  hero z soczewką, marquee, kategorie, katalog, zapytanie
components/motion/              SplitLines, SeamTransition, Lens, Reveal, LenisProvider
lib/data/                       SEAM + mocki (products, k9, filters, copy, faq)
brand/logo.png                  źródło marki (-> scripts/gen-brand.mjs)
public/placeholder/             tymczasowe grafiki produktów (-> scripts/gen-placeholders.mjs)
```

## Motyw jasny i ciemny

Strona główna chodzi na jasnej palecie (`pk-*`), reszta serwisu na ciemnej (`nf-*`).
`ThemeSync` ustawia `data-theme` na `<html>`, a skrypt w `<head>` robi to jeszcze przed
pierwszym malowaniem, więc jasna strona nie miga grafitem. Header sam próbkuje, co pod nim
leży, i przełącza motyw, gdy wjeżdża pod niego ciemny panel K9.

## Ruch

Cały ruch jest wygaszany przy `prefers-reduced-motion`. `SeamTransition` (przejście między
światami na stronie głównej) ma **wariant bezpieczny jako domyślny**: dopóki JS nie potwierdzi,
że animacja ruszy, oba panele stoją jeden pod drugim w normalnym przepływie. Bez tego przy
wyłączonych animacjach wejście do sklepu znikało pod ciemnym panelem.

## Assety marki

Źródłem jest `brand/logo.png`. Po podmianie:

```bash
node scripts/gen-brand.mjs
```

Skrypt wycina tło (flood fill od krawędzi), rozdziela grafikę na sygnet, kadr głowy i wordmark
i generuje favicony, apple-icon oraz obrazek OG. W nagłówku jest **kadr głowy**, bo pełna
sylwetka w skali paska robi się nieczytelnym paskiem; w stopce jest pełna sylwetka w wariancie
na ciemne tło (czarna sylwetka znikała na czerni).

## Zdjęcia produktów

`public/placeholder/*.svg` to tymczasowe grafiki generowane skryptem
(`node scripts/gen-placeholders.mjs`). Docelowe zdjęcia wchodzą przez `Product.images`
(karta: zdjęcie główne i hover) oraz `Product.gallery` (karta produktu, min. 3 ujęcia).
Podmiana zdjęć nie wymaga zmian w kodzie.
