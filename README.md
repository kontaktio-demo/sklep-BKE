# PAKT - sklep z obrożami (frontend, bez backendu)

Polskojęzyczny sklep dla marki sprzętu dla psów pracujących. To **dwa osobne sklepy**,
nie dwa warianty jednego:

| | PAKT (cywilny) | PAKT-K9 (służbowy) |
|---|---|---|
| adresy | `/`, `/collections/collars`, `/products/<slug>`, `/koszyk`, `/szukaj`, strony informacyjne | `/k9`, `/k9/<kategoria>`, `/k9/produkt/<slug>`, `/k9/zapytanie` |
| katalog | 26 modeli (`line: "shop"`) | 12 modeli (`line: "k9"`), niedostępnych w sklepie cywilnym |
| wygląd | jasny szary papier, białe kadry, czerwień jako akcent | grafit, ciemna czerwień, siatka techniczna, monospace na kody |

Sprzęt z jednej linii nie pojawia się w drugiej: pilnuje tego seam (`lib/data/index.ts`),
osobna przestrzeń adresów (`lib/routes.ts`) i `notFound()` na obu trasach kart produktu.

Ceny w PLN, formatowanie `pl-PL`. Backendu nie ma: formularze nie udają wysyłki, tylko
przygotowują treść i otwierają program pocztowy. Koszyk żyje w `localStorage`.

## Tożsamość PAKT-K9 (`K9_IDENTITY.md`) - wartości są prawem

Sekcja K9 ma **własną tożsamość wizualną**, opisaną w `K9_IDENTITY.md`. Obowiązuje na
trasach `/k9/*` i nie wolno w niej podmieniać wartości "na oko":

- **Paleta:** tło `#0E0E0E`, karty `#161616`, warstwa wyższa `#1E1E1E`, tekst `#EDEDED`,
  drobny `#8A8A8A`, linie `rgba(255,255,255,.08)` / `.16`. Czerwień `#E50914` jest
  **jedynym** akcentem i używa się jej oszczędnie (CTA, stan aktywny, linia sekcji,
  jedno słowo w nagłówku). Nigdy jako duże wypełnienie.
- **Typografia:** Archivo 800/900 (nagłówki, wersaliki, ciasny tracking), Geist Sans
  (treść), **Geist Mono (każdy odczyt techniczny: `K9-01`, `ZERWANIE 380 KG`, `1000D`)**.
  Inter i system-ui są w K9 **zakazane**. Klasy: `type-k9-hero` / `-h2` / `-h3` / `-body`
  / `-meta` / `-spec` / `-eyebrow`.
- **Geometria:** promień maks. 2 px (token `--radius-control`, w sklepie cywilnym 4 px),
  elewacja przez **rozjaśnienie obwódki**, nigdy przez cień. Zero gradientowych plam,
  zero ikon w kółkach, zero wyśrodkowanego wszystkiego.
- **Rytm:** kontener 1440 px; sekcje gęste `clamp(56px, 6vw, 88px)`, sekcje oddechowe
  `clamp(96px, 12vw, 160px)`. Padding nie jest wszędzie ten sam - to celowe.

Zanim dołożysz cokolwiek do `/k9`, sprawdź listę zakazów (§6 dokumentu). Jeżeli element
nie stoi ani w referencji, ani w specyfikacji, nie ma go tam.

## Dwa światy w jednym zestawie nazw (`app/globals.css`)

Tokeny `nf-*` są **semantyczne i odwracają się same** w zależności od zakresu:

| token | sklep cywilny | PAKT-K9 |
|---|---|---|
| `nf-bg` | `#f0f0ee` (tło strony) | grafit `#1c1f22` |
| `nf-elevated` | biel (kadr, karta) | ciemniejszy grafit |
| `nf-white` | tusz `#16161a` | biel |
| `nf-red` | `#c20812` | ciemna czerwień `#8f1d14` |

`nf-white` to **maksymalny kontrast**, a nie "biel". Dzięki temu ten sam komponent działa
w obu światach bez rozgałęzień w kodzie.

Ciemny motyw włącza się z **trasy** (`ThemeSync` ustawia `data-theme="dark"` na `/k9/*`).
Ciemna wyspa na jasnej stronie (stopka, newsletter, kafel wejściowy K9) dostaje
`data-shell="dark"` i odwraca tokeny w swoim poddrzewie.

Nagłówki: Fjalla One (kondensowany, uppercase) przez klasy `type-display` / `type-h1` /
`type-h2` / `type-h3`. **Komponenty nie definiują własnych rozmiarów nagłówków.**
Monospace (`type-meta`) należy wyłącznie do sekcji K9.

## Zdjęcia (`public/foto/`)

Fotografii jeszcze nie ma i nie są generowane. Kafle i baner mają sloty: wystarczy wrzucić
plik do `public/foto/`, żeby wypełnił kadr (`lib/photos.ts` sprawdza, czy plik istnieje).
Rozpoznawane nazwy: `hero.jpg`, `sklep.jpg`, `k9.jpg`, `robocze.jpg`, `codzienne.jpg`,
`e-obroza.jpg`. Bez pliku kafel zostaje płaską płaszczyzną z materiału sekcji, a nie atrapą
udającą zdjęcie.

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
getRelatedProducts(slug, limit?): Promise<Product[]>   // nie miesza linii shop i k9
getK9Categories(): Promise<K9CategoryInfo[]>
getK9Category(slug): Promise<K9CategoryInfo | null>
getK9Products(category?): Promise<Product[]>
```

**Żadna funkcja seamu nie zwraca obu linii naraz** i tak ma zostać. `generateStaticParams`
buduje trasy sklepu z `getProducts("collars")`, a trasy K9 z `getK9Products()` - dzięki temu
nie da się wygenerować karty sprzętu służbowego pod cywilnym adresem `/products/<slug>`.
(Poprzednie `getProductSlugs()` sklejało slugi obu linii i zostało usunięte właśnie dlatego.)

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
