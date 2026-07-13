import { SIZE_NECK, SIZE_ORDER, SIZE_SHORT, deriveVariantFields } from "../sizes";
import type {
  CollarSize,
  K9Category,
  K9CategoryInfo,
  Product,
  ProductColor,
  ProductSpec,
  ProductVariant,
} from "../types";

// Linia PAKT-K9: sprzet sluzbowy. Te produkty NIE pojawiaja sie w zwyklym sklepie.
// Pies sluzbowy to owczarek, malinois albo spaniel do pracy wechowej - stad rozmiary
// zaczynaja sie od sredniego, a maly wystepuje tylko tam, gdzie pracuje maly pies.

const C: Record<string, ProductColor> = {
  czarny: { name: "Czarny", hex: "#1F1F1F" },
  coyote: { name: "Coyote", hex: "#7A5C3E" },
  oliwkowy: { name: "Oliwkowy", hex: "#3E4634" },
  grafitowy: { name: "Grafitowy", hex: "#4B4F55" },
  ranger: { name: "Ranger Green", hex: "#4A5D43" },
};

interface K9Spec {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  /** rozmiary, w ktorych model istnieje */
  sizes: CollarSize[];
  /** cena najmniejszego oferowanego rozmiaru */
  basePrice: number;
  /** doplata za kazdy kolejny rozmiar */
  sizeStep: number;
  /** waga najmniejszego oferowanego rozmiaru, w gramach */
  baseWeight: number;
  /** przyrost wagi na kazdy kolejny rozmiar */
  weightStep: number;
  /** warianty chwilowo niedostepne */
  soldOut?: CollarSize[];
  colors: ProductColor[];
  k9Category: K9Category;
  k9Standard: string;
  width: Product["width"];
  type: Product["type"];
  idPanelCompatible: boolean;
  badges?: Product["badges"];
  bestsellerRank?: number;
  createdAt: string;
  /** cechy wspolne modelu. Obwod szyi i waga sa w wariancie. */
  specs: ProductSpec[];
}

function variantsFor(spec: K9Spec): ProductVariant[] {
  const model = (spec.slug.split("-")[1] ?? spec.slug).slice(0, 3).toUpperCase();
  const trunk = `K9-${model}-${spec.width.replace(".", "")}`;
  const offered = SIZE_ORDER.filter((size) => spec.sizes.includes(size));

  return offered.map((size, step) => ({
    size,
    sku: `${trunk}-${SIZE_SHORT[size]}`,
    price: spec.basePrice + step * spec.sizeStep,
    inStock: !spec.soldOut?.includes(size),
    neck: SIZE_NECK[size],
    weightGrams: spec.baseWeight + step * spec.weightStep,
  }));
}

function k9(spec: K9Spec): Product {
  const model = (spec.slug.split("-")[1] ?? spec.slug).slice(0, 3).toUpperCase();
  const derived = deriveVariantFields(variantsFor(spec));
  const badges = spec.badges ?? [];

  // plakietka i dostepnosc musza mowic to samo - inaczej karta zaprzecza sama sobie
  if (badges.includes("sold-out") === derived.inStock) {
    throw new Error(
      `Produkt ${spec.slug}: plakietka "sold-out" nie zgadza się z dostępnością wariantów`
    );
  }

  return {
    ...derived,
    id: `k9_${spec.slug}`,
    slug: spec.slug,
    name: spec.name,
    tagline: spec.tagline,
    description: spec.description,
    highlights: spec.highlights,
    specs: spec.specs,
    currency: "PLN",
    sku: `K9-${model}-${spec.width.replace(".", "")}`,
    images: [`/placeholder/${spec.slug}-1.svg`, `/placeholder/${spec.slug}-2.svg`],
    gallery: [1, 2, 3, 4].map((n) => `/placeholder/${spec.slug}-${n}.svg`),
    colors: spec.colors,
    badges,
    category: spec.k9Category === "e-collar" ? "e-collar" : "working",
    type: spec.type,
    width: spec.width,
    idPanelCompatible: spec.idPanelCompatible,
    bestsellerRank: spec.bestsellerRank,
    productType: "Obroża służbowa",
    createdAt: spec.createdAt,
    line: "k9",
    k9Category: spec.k9Category,
    k9Standard: spec.k9Standard,
  };
}

const nylonSpecs = (width: string, idPanel: boolean): ProductSpec[] => [
  { label: "Materiał", value: "Nylon 1000D, wyściółka z neoprenu" },
  { label: "Okucia", value: "Klamra stalowa, D-ring spawany" },
  { label: "Szerokość", value: width },
  { label: "Panel ID", value: idPanel ? "Tak, rzep na całej długości" : "Brak" },
  { label: "Wytrzymałość", value: "Zerwanie przy 380 kg (test statyczny)" },
  { label: "Produkcja", value: "Szyte w Polsce" },
  { label: "Gwarancja", value: "2 lata" },
];

export const k9Products: Product[] = [
  k9({
    slug: "k9-patrol-duty-collar",
    name: "Obroża patrolowa K9 Patrol",
    tagline: "Taśma 4,5 cm, klamra stalowa, panel ID",
    description:
      "Obroża do służby patrolowej. Taśma 1000D w dwóch warstwach rozkłada nacisk przy szarpnięciu, klamra stalowa przenosi obciążenie bez odkształcenia. Rzep na całej długości przyjmuje panele identyfikacyjne i naszywki jednostki.",
    highlights: [
      "Taśma dwuwarstwowa 1000D",
      "Klamra stalowa, nie tworzywo",
      "Zerwanie przy 380 kg",
      "Rzep na panele ID",
    ],
    sizes: ["medium", "large"],
    basePrice: 389,
    sizeStep: 30,
    baseWeight: 146,
    weightStep: 22,
    colors: [C.czarny, C.oliwkowy, C.coyote],
    k9Category: "patrol",
    k9Standard: "Klasa robocza / patrol",
    width: "1.75",
    type: "nylon",
    idPanelCompatible: true,
    badges: ["bestseller"],
    bestsellerRank: 1,
    createdAt: "2026-01-18",
    specs: nylonSpecs("4,5 cm", true),
  }),
  k9({
    slug: "k9-grip-handle-collar",
    name: "Obroża z uchwytem K9 Grip",
    tagline: "Uchwyt kontrolny, szybkie przejęcie psa",
    description:
      "Obroża z uchwytem do bezpośredniej kontroli psa przy wejściu i w ciasnych pomieszczeniach. Uchwyt naszyty na całej szerokości taśmy, wzmocniony przeszyciem krzyżowym. Przewodnik przejmuje psa jednym chwytem, bez sięgania po smycz.",
    highlights: [
      "Uchwyt kontrolny 12 cm",
      "Przeszycie krzyżowe uchwytu",
      "Taśma 4,5 cm, 1000D",
      "Rzep na panele ID",
    ],
    sizes: ["medium", "large"],
    basePrice: 449,
    sizeStep: 30,
    baseWeight: 190,
    weightStep: 24,
    colors: [C.czarny, C.oliwkowy],
    k9Category: "handle",
    k9Standard: "Klasa robocza / interwencja",
    width: "1.75",
    type: "nylon",
    idPanelCompatible: true,
    badges: ["bestseller"],
    bestsellerRank: 2,
    createdAt: "2026-02-02",
    specs: [
      ...nylonSpecs("4,5 cm", true),
      { label: "Uchwyt", value: "12 cm, przeszycie krzyżowe" },
    ],
  }),
  k9({
    slug: "k9-breach-handle-collar",
    name: "Obroża z uchwytem K9 Breach",
    tagline: "Krótki uchwyt, praca w pomieszczeniach",
    description:
      "Wersja z krótszym uchwytem do pracy w ciasnych przejściach, gdzie długa pętla zaczepia o wyposażenie. Taśma węższa o pół centymetra, przez co obroża mniej ogranicza ruch szyi przy szybkim obrocie psa.",
    highlights: [
      "Uchwyt 8 cm, niskoprofilowy",
      "Taśma 4 cm",
      "Klamra stalowa",
      "Rzep na panele ID",
    ],
    sizes: ["medium", "large"],
    basePrice: 419,
    sizeStep: 25,
    baseWeight: 166,
    weightStep: 20,
    colors: [C.czarny, C.grafitowy],
    k9Category: "handle",
    k9Standard: "Klasa robocza / interwencja",
    width: "1.5",
    type: "nylon",
    idPanelCompatible: true,
    badges: ["new"],
    bestsellerRank: 6,
    createdAt: "2026-06-11",
    specs: [
      ...nylonSpecs("4 cm", true),
      { label: "Uchwyt", value: "8 cm, niskoprofilowy" },
    ],
  }),
  k9({
    slug: "k9-mount-e-collar",
    name: "Obroża pod moduł K9 Mount",
    tagline: "Montaż modułu do 45 mm, bez luzu",
    description:
      "Taśma przygotowana pod montaż modułu elektronicznego. Dwa pasy prowadzące trzymają moduł nieruchomo przy biegu, elektrody zachowują stały kontakt. Obroża pracuje razem z obrożą główną, nie zastępuje jej.",
    highlights: [
      "Prowadnice pod moduł 45 mm",
      "Moduł bez przesuwu przy biegu",
      "Taśma 4 cm",
      "Praca z obrożą główną",
    ],
    sizes: ["medium", "large"],
    basePrice: 279,
    sizeStep: 20,
    baseWeight: 142,
    weightStep: 18,
    colors: [C.czarny, C.oliwkowy],
    k9Category: "e-collar",
    k9Standard: "Zgodna z modułami do 45 mm",
    width: "1.5",
    type: "nylon",
    idPanelCompatible: false,
    bestsellerRank: 4,
    createdAt: "2025-12-05",
    specs: [
      ...nylonSpecs("4 cm", false),
      { label: "Moduł", value: "Zgodna z obudowami do 45 mm" },
    ],
  }),
  k9({
    slug: "k9-relay-e-collar",
    name: "Obroża pod moduł K9 Relay",
    tagline: "Szeroka taśma, moduł i panel ID razem",
    description:
      "Wersja szersza, gdy pies pracuje jednocześnie z modułem i panelem identyfikacyjnym. Taśma 4,5 cm rozdziela strefy: moduł na prowadnicach z jednej strony, rzep pod panel z drugiej, bez nachodzenia na siebie.",
    highlights: [
      "Taśma 4,5 cm",
      "Prowadnice pod moduł 45 mm",
      "Rzep na panele ID",
      "Klamra stalowa",
    ],
    sizes: ["medium", "large"],
    basePrice: 329,
    sizeStep: 25,
    baseWeight: 156,
    weightStep: 20,
    soldOut: ["large"],
    colors: [C.czarny, C.ranger],
    k9Category: "e-collar",
    k9Standard: "Zgodna z modułami do 45 mm",
    width: "1.75",
    type: "nylon",
    idPanelCompatible: true,
    bestsellerRank: 5,
    createdAt: "2026-03-22",
    specs: [
      ...nylonSpecs("4,5 cm", true),
      { label: "Moduł", value: "Zgodna z obudowami do 45 mm" },
    ],
  }),
  k9({
    slug: "k9-drill-training-collar",
    name: "Obroża szkoleniowa K9 Drill",
    tagline: "Codzienne szkolenie, wysoka odporność na ścieranie",
    description:
      "Obroża na sesje szkoleniowe, gdzie sprzęt pracuje w piachu i błocie. Taśma odporna na ścieranie, okucia bez powłok lakierniczych, które i tak schodzą po kilku tygodniach. Prosta konstrukcja, mniej miejsc na awarię.",
    highlights: [
      "Taśma odporna na ścieranie",
      "Okucia bez powłok lakierniczych",
      "Taśma 4 cm",
      "Konstrukcja bez zbędnych elementów",
    ],
    sizes: ["medium", "large"],
    basePrice: 249,
    sizeStep: 20,
    baseWeight: 138,
    weightStep: 18,
    colors: [C.oliwkowy, C.coyote, C.czarny],
    k9Category: "training",
    k9Standard: "Klasa robocza / szkolenie",
    width: "1.5",
    type: "nylon",
    idPanelCompatible: false,
    bestsellerRank: 3,
    createdAt: "2025-11-14",
    specs: nylonSpecs("4 cm", false),
  }),
  k9({
    slug: "k9-check-training-chain",
    name: "Obroża półzaciskowa K9 Check",
    tagline: "Stal nierdzewna, kontrolowany zacisk",
    description:
      "Obroża półzaciskowa do korekty w szkoleniu. Ogniwa spawane ze stali nierdzewnej, zacisk ograniczony taśmą, więc obroża nie zaciska się bez końca. Do pracy pod nadzorem przewodnika, nie do zostawiania na psie.",
    highlights: [
      "Ogniwa spawane, stal nierdzewna",
      "Zacisk ograniczony taśmą",
      "Do pracy pod nadzorem",
      "D-ring spawany",
    ],
    sizes: ["medium", "large"],
    basePrice: 289,
    sizeStep: 25,
    baseWeight: 178,
    weightStep: 34,
    soldOut: ["large"],
    colors: [C.grafitowy],
    k9Category: "training",
    k9Standard: "Klasa robocza / szkolenie",
    width: "1",
    type: "chain",
    idPanelCompatible: false,
    createdAt: "2025-09-08",
    specs: [
      { label: "Materiał", value: "Stal nierdzewna, polerowana" },
      { label: "Okucia", value: "Ogniwa spawane, D-ring ze stali" },
      { label: "Szerokość", value: "2,5 cm" },
      { label: "Panel ID", value: "Brak" },
      { label: "Wytrzymałość", value: "Zerwanie przy 420 kg (test statyczny)" },
      { label: "Produkcja", value: "Montowane w Polsce" },
      { label: "Gwarancja", value: "2 lata" },
    ],
  }),
  k9({
    slug: "k9-scent-detection-collar",
    name: "Obroża do pracy węchowej K9 Scent",
    tagline: "Lekka, nie obciąża psa przy długim tropieniu",
    description:
      "Obroża do pracy węchowej, gdzie pies pracuje godzinami z opuszczoną głową. Lekka taśma i brak zbędnych okuć ograniczają obciążenie karku. Panel ID przeniesiony na bok, żeby nie ocierał przy schylonej głowie.",
    highlights: [
      "Waga poniżej 120 g",
      "Panel ID przeniesiony na bok",
      "Taśma 4 cm",
      "Minimum okuć",
    ],
    // do pracy wechowej ida takze psy male (spaniele), stad rozmiar maly.
    // Duzy nie istnieje: przy 132 g obietnica "ponizej 120 g" bylaby nieprawdziwa.
    sizes: ["small", "medium"],
    basePrice: 269,
    sizeStep: 15,
    baseWeight: 104,
    weightStep: 14,
    colors: [C.oliwkowy, C.coyote],
    k9Category: "detection",
    k9Standard: "Klasa robocza / detekcja",
    width: "1.5",
    type: "nylon",
    idPanelCompatible: true,
    bestsellerRank: 7,
    createdAt: "2026-04-30",
    specs: nylonSpecs("4 cm", true),
  }),
  k9({
    slug: "k9-track-detection-collar",
    name: "Obroża do tropienia K9 Track",
    tagline: "Praca na długiej lince, wzmocniony D-ring",
    description:
      "Obroża do tropienia na długiej lince. D-ring spawany, osadzony na podwójnej taśmie, przenosi ciągnięcie pod kątem, gdy pies pracuje w bok od przewodnika. Odblaskowa nić na całej długości do pracy po zmroku.",
    highlights: [
      "D-ring na podwójnej taśmie",
      "Odblaskowa nić na całej długości",
      "Taśma 4,5 cm",
      "Do pracy na długiej lince",
    ],
    sizes: ["medium", "large"],
    basePrice: 309,
    sizeStep: 25,
    baseWeight: 140,
    weightStep: 18,
    colors: [C.oliwkowy, C.czarny],
    k9Category: "detection",
    k9Standard: "Klasa robocza / detekcja",
    width: "1.75",
    type: "nylon",
    idPanelCompatible: true,
    badges: ["new"],
    createdAt: "2026-06-24",
    specs: nylonSpecs("4,5 cm", true),
  }),
  k9({
    slug: "k9-sentry-patrol-collar",
    name: "Obroża patrolowa K9 Sentry",
    tagline: "Wersja nocna, taśma odblaskowa",
    description:
      "Obroża patrolowa z taśmą odblaskową na całej długości. Pies pozostaje widoczny w świetle latarki i reflektorów na dystansie, na którym zwykła czarna taśma znika. Reszta konstrukcji jak w wersji dziennej.",
    highlights: [
      "Taśma odblaskowa na całej długości",
      "Klamra stalowa",
      "Taśma 4,5 cm",
      "Rzep na panele ID",
    ],
    sizes: ["medium", "large"],
    basePrice: 409,
    sizeStep: 30,
    baseWeight: 150,
    weightStep: 22,
    colors: [C.czarny, C.grafitowy],
    k9Category: "patrol",
    k9Standard: "Klasa robocza / patrol",
    width: "1.75",
    type: "nylon",
    idPanelCompatible: true,
    createdAt: "2026-05-02",
    specs: nylonSpecs("4,5 cm", true),
  }),
  k9({
    slug: "k9-anchor-patrol-collar",
    name: "Obroża patrolowa K9 Anchor",
    tagline: "Dwa D-ringi, praca w dwóch punktach",
    description:
      "Obroża z dwoma punktami zaczepu: górnym do prowadzenia i bocznym do wpięcia linki roboczej. Przewodnik zmienia punkt kontroli bez przepinania obroży. Konstrukcja wzmocniona w obu punktach osobnym przeszyciem.",
    highlights: [
      "Dwa punkty zaczepu",
      "Wzmocnienie w obu punktach",
      "Taśma 4,5 cm",
      "Klamra stalowa",
    ],
    sizes: ["medium", "large"],
    basePrice: 439,
    sizeStep: 30,
    baseWeight: 160,
    weightStep: 24,
    colors: [C.czarny, C.oliwkowy, C.coyote],
    k9Category: "patrol",
    k9Standard: "Klasa robocza / patrol",
    width: "1.75",
    type: "nylon",
    idPanelCompatible: true,
    createdAt: "2026-01-30",
    specs: nylonSpecs("4,5 cm", true),
  }),
  k9({
    slug: "k9-cadet-training-collar",
    name: "Obroża szkoleniowa K9 Cadet",
    tagline: "Dla psów w szkoleniu podstawowym",
    description:
      "Obroża dla psów wchodzących w szkolenie, jeszcze przed przydziałem do zadań. Węższa taśma i mniejszy zakres obwodu, bo młody pies nie ma jeszcze docelowej masy. Ta sama klamra i te same przeszycia co w wersjach służbowych.",
    highlights: [
      "Taśma 4 cm",
      "Rozmiary S i M, obwód 28-46 cm",
      "Klamra stalowa",
      "Przeszycia jak w wersjach służbowych",
    ],
    // pies w szkoleniu podstawowym nie ma jeszcze docelowej masy - duzy nie ma tu sensu
    sizes: ["small", "medium"],
    basePrice: 229,
    sizeStep: 15,
    baseWeight: 118,
    weightStep: 14,
    soldOut: ["small", "medium"],
    colors: [C.oliwkowy, C.czarny],
    k9Category: "training",
    k9Standard: "Klasa robocza / szkolenie",
    width: "1.5",
    type: "nylon",
    idPanelCompatible: false,
    badges: ["sold-out"],
    createdAt: "2025-10-19",
    specs: nylonSpecs("4 cm", false),
  }),
];

const CATEGORY_META: Record<K9Category, { code: string; title: string; description: string }> = {
  patrol: {
    code: "K9-01",
    title: "Patrol",
    description:
      "Obroże do służby patrolowej. Szeroka taśma, stalowe okucia, miejsce na panele identyfikacyjne.",
  },
  handle: {
    code: "K9-02",
    title: "Z uchwytem",
    description:
      "Uchwyt kontrolny do przejęcia psa jednym chwytem, przy wejściu i w ciasnych pomieszczeniach.",
  },
  "e-collar": {
    code: "K9-03",
    title: "Pod moduł",
    description:
      "Taśmy z prowadnicami pod moduł elektroniczny. Moduł nie przesuwa się przy biegu.",
  },
  training: {
    code: "K9-04",
    title: "Szkolenie",
    description:
      "Sprzęt na sesje szkoleniowe. Odporność na ścieranie, prosta konstrukcja, mniej miejsc na awarię.",
  },
  detection: {
    code: "K9-05",
    title: "Praca węchowa",
    description:
      "Lekkie obroże do tropienia i detekcji. Mniejsze obciążenie karku przy długiej pracy z opuszczoną głową.",
  },
};

export const k9Categories: K9CategoryInfo[] = (
  Object.keys(CATEGORY_META) as K9Category[]
).map((slug) => ({
  slug,
  ...CATEGORY_META[slug],
  productCount: k9Products.filter((p) => p.k9Category === slug).length,
}));
