import { SIZE_NECK, SIZE_ORDER, SIZE_SHORT, WIDTH_LABEL, deriveVariantFields } from "../sizes";
import type {
  CollarCategory,
  CollarSize,
  CollarType,
  CollarWidth,
  Product,
  ProductBadge,
  ProductColor,
  ProductSpec,
  ProductVariant,
} from "../types";
import { productCopy } from "./copy.pl";

const C: Record<string, ProductColor> = {
  czarny: { name: "Czarny", hex: "#1F1F1F" },
  coyote: { name: "Coyote", hex: "#7A5C3E" },
  oliwkowy: { name: "Oliwkowy", hex: "#4A5D43" },
  szary: { name: "Szary", hex: "#8E9193" },
  czerwony: { name: "Czerwony", hex: "#B3001B" },
  granatowy: { name: "Granatowy", hex: "#22304A" },
  pomaranczowy: { name: "Pomarańczowy", hex: "#C75000" },
  piaskowy: { name: "Piaskowy", hex: "#C7B299" },
  bialy: { name: "Biały", hex: "#E8E6E1" },
  stalowy: { name: "Stalowy", hex: "#9EA3A8" },
  grafitowy: { name: "Grafitowy", hex: "#4B4F55" },
};

/**
 * Wejscie dla jednego MODELU. Rozmiar nie jest tu atrybutem - model deklaruje, w jakich
 * rozmiarach istnieje, a warianty (cena, SKU, dostepnosc, obwod, waga) sa z tego liczone.
 * price / fromPrice / inStock / sizes NIE sa polami wejscia: to wynik wariantow.
 */
interface Spec {
  id?: string;
  slug: string;
  name: string;
  /** rozmiary, w ktorych model ma sens. Kolejnosc bez znaczenia, warianty ida SIZE_ORDER. */
  sizes: CollarSize[];
  /** cena najmniejszego oferowanego rozmiaru */
  basePrice: number;
  /** doplata za kazdy kolejny rozmiar (wiecej materialu, mocniejsze okucia) */
  sizeStep: number;
  /** warianty chwilowo niedostepne. Model znika ze sklepu dopiero, gdy nie ma zadnego. */
  soldOut?: CollarSize[];
  colors: ProductColor[];
  badges: ProductBadge[];
  category: CollarCategory;
  type: CollarType;
  width: CollarWidth;
  idPanelCompatible: boolean;
  bestsellerRank?: number;
  createdAt: string;
}

/** Ile tasmy zjada rozmiar. Waga wariantu = okucia (od szerokosci) + tasma (od rozmiaru). */
const TAPE_CM: Record<CollarSize, number> = { small: 6, medium: 12, large: 18 };

function weightFor(spec: Spec, size: CollarSize): number {
  const gramsPerCm = spec.type === "nylon" ? 1.6 : 4.2;
  const base = spec.width === "1.75" ? 78 : spec.width === "1.5" ? 64 : 46;
  return Math.round(base + gramsPerCm * TAPE_CM[size]);
}

/** SKU modelu. Trzon = pierwszy człon slugu (ranger-duty-collar -> RAN) + szerokosc. */
function skuTrunk(spec: Spec): string {
  const model = (spec.slug.split("-")[0] ?? "").slice(0, 3).toUpperCase();
  return `DS-${model}-${spec.width.replace(".", "")}`;
}

function variantsFor(spec: Spec): ProductVariant[] {
  const offered = SIZE_ORDER.filter((size) => spec.sizes.includes(size));
  const trunk = skuTrunk(spec);

  return offered.map((size, step) => ({
    size,
    sku: `${trunk}-${SIZE_SHORT[size]}`,
    price: spec.basePrice + step * spec.sizeStep,
    inStock: !spec.soldOut?.includes(size),
    neck: SIZE_NECK[size],
    weightGrams: weightFor(spec, size),
  }));
}

/**
 * Cechy wspolne modelu. Obwod szyi i waga tu NIE naleza - zaleza od rozmiaru, wiec
 * siedza w wariancie. Reszta jest wyprowadzona z faset, zeby tabela nie mogla
 * zaprzeczyc filtrom.
 */
function buildSpecs(spec: Spec): ProductSpec[] {
  const nylon = spec.type === "nylon";

  return [
    {
      label: "Materiał",
      value: nylon ? "Nylon 1000D, wyściółka z neoprenu" : "Stal nierdzewna, polerowana",
    },
    {
      label: "Okucia",
      value: nylon
        ? "Klamra zatrzaskowa i D-ring ze stopu cynku"
        : "Ogniwa spawane, D-ring ze stali",
    },
    { label: "Szerokość", value: WIDTH_LABEL[spec.width] },
    { label: "Panel ID", value: spec.idPanelCompatible ? "Tak, rzep na całej długości" : "Brak" },
    {
      label: "E-obroża",
      value: spec.category === "e-collar" ? "Zgodna z modułami do 45 mm" : "Niezalecana",
    },
    { label: "Produkcja", value: nylon ? "Szyte w Polsce" : "Montowane w Polsce" },
    { label: "Gwarancja", value: "2 lata" },
  ];
}

function collar(spec: Spec): Product {
  const copy = productCopy[spec.slug];
  if (!copy) throw new Error(`Brak polskiej treści dla produktu: ${spec.slug}`);

  const derived = deriveVariantFields(variantsFor(spec));

  // Plakietka "sold-out" i dostepnosc wychodza z dwoch roznych miejsc. Gdy sie rozjada,
  // karta klamie: krzyczy "wyprzedane" nad przyciskiem "Do koszyka" albo odwrotnie.
  const soldOutBadge = spec.badges.includes("sold-out");
  if (soldOutBadge === derived.inStock) {
    throw new Error(
      `Produkt ${spec.slug}: plakietka "sold-out" nie zgadza się z dostępnością wariantów`
    );
  }

  return {
    ...copy,
    ...derived,
    id: spec.id ?? `col_${spec.slug}`,
    slug: spec.slug,
    name: spec.name,
    currency: "PLN",
    productType: "Obroża",
    sku: skuTrunk(spec),
    specs: buildSpecs(spec),
    images: [`/placeholder/${spec.slug}-1.svg`, `/placeholder/${spec.slug}-2.svg`],
    gallery: [1, 2, 3, 4].map((n) => `/placeholder/${spec.slug}-${n}.svg`),
    colors: spec.colors,
    badges: spec.badges,
    category: spec.category,
    type: spec.type,
    width: spec.width,
    idPanelCompatible: spec.idPanelCompatible,
    bestsellerRank: spec.bestsellerRank,
    createdAt: spec.createdAt,
    line: "shop",
  };
}

export const products: Product[] = [
  collar({
    slug: "ranger-duty-collar",
    // Slowa SLUZBOWA / KLASA ROBOCZA sa zarezerwowane dla linii Dog Store Pro. Sklep cywilny
    // nazywa rzeczy po swojemu, inaczej obietnica "tych pozycji nie znajdziesz w sklepie
    // cywilnym" rozjezdza sie z polka. Slugi zostaja - wisza na nich pliki w /public.
    name: "Obroża robocza Ranger",
    // tasma 4,5 cm na malym psie to nieporozumienie - model zaczyna sie od sredniego
    sizes: ["medium", "large"],
    basePrice: 239,
    sizeStep: 25,
    colors: [C.coyote, C.oliwkowy, C.czarny],
    badges: ["bestseller"],
    category: "working",
    type: "nylon",
    width: "1.75",
    idPanelCompatible: true,
    bestsellerRank: 1,
    createdAt: "2025-06-14",
  }),
  collar({
    slug: "fjord-everyday-collar",
    name: "Obroża codzienna Fjord",
    // waska tasma codzienna: sensowna w calym zakresie
    sizes: ["small", "medium", "large"],
    basePrice: 139,
    sizeStep: 15,
    colors: [C.granatowy, C.piaskowy, C.czerwony],
    badges: ["bestseller"],
    category: "non-working",
    type: "nylon",
    width: "1",
    idPanelCompatible: false,
    bestsellerRank: 2,
    createdAt: "2025-04-02",
  }),
  collar({
    slug: "sentinel-id-collar",
    name: "Obroża Sentinel ID",
    sizes: ["medium", "large"],
    basePrice: 259,
    sizeStep: 20,
    colors: [C.czarny, C.szary],
    badges: ["bestseller"],
    category: "working",
    type: "nylon",
    width: "1.75",
    idPanelCompatible: true,
    bestsellerRank: 3,
    createdAt: "2025-07-21",
  }),
  collar({
    slug: "bolt-e-fit-collar",
    name: "Obroża Bolt E-Fit",
    sizes: ["medium", "large"],
    basePrice: 279,
    sizeStep: 20,
    soldOut: ["large"],
    colors: [C.czarny, C.oliwkowy],
    badges: ["bestseller"],
    category: "e-collar",
    type: "nylon",
    width: "1.5",
    idPanelCompatible: true,
    bestsellerRank: 4,
    createdAt: "2025-09-30",
  }),
  collar({
    slug: "vanguard-collar",
    name: "Obroża uniwersalna Vanguard",
    sizes: ["medium", "large"],
    basePrice: 319,
    sizeStep: 30,
    colors: [C.coyote, C.czarny],
    badges: ["bestseller"],
    category: "working",
    type: "nylon",
    width: "1.75",
    idPanelCompatible: true,
    bestsellerRank: 5,
    createdAt: "2025-05-11",
  }),
  collar({
    slug: "nightwatch-reflective-collar",
    name: "Obroża odblaskowa Nightwatch",
    sizes: ["small", "medium", "large"],
    basePrice: 169,
    sizeStep: 10,
    colors: [C.czarny, C.pomaranczowy],
    badges: ["new"],
    category: "non-working",
    type: "nylon",
    width: "1",
    idPanelCompatible: false,
    bestsellerRank: 6,
    createdAt: "2026-05-19",
  }),
  collar({
    slug: "grizzly-alpine-collar",
    name: "Obroża trekkingowa Grizzly",
    sizes: ["medium", "large"],
    basePrice: 235,
    sizeStep: 20,
    colors: [C.oliwkowy, C.granatowy, C.coyote],
    badges: [],
    category: "non-working",
    type: "nylon",
    width: "1.5",
    idPanelCompatible: false,
    bestsellerRank: 7,
    createdAt: "2025-08-08",
  }),
  collar({
    slug: "ridgeline-field-collar",
    name: "Obroża terenowa Ridgeline",
    sizes: ["medium", "large"],
    basePrice: 219,
    sizeStep: 20,
    colors: [C.oliwkowy, C.coyote],
    badges: [],
    category: "working",
    type: "nylon",
    width: "1.5",
    idPanelCompatible: true,
    bestsellerRank: 8,
    createdAt: "2025-03-27",
  }),
  collar({
    slug: "bastion-heavy-collar",
    name: "Obroża wzmocniona Bastion",
    sizes: ["medium", "large"],
    basePrice: 359,
    sizeStep: 30,
    colors: [C.czarny, C.szary],
    badges: [],
    category: "working",
    type: "nylon",
    width: "1.75",
    idPanelCompatible: true,
    bestsellerRank: 9,
    createdAt: "2025-10-15",
  }),
  collar({
    slug: "halo-comfort-collar",
    name: "Obroża komfortowa Halo",
    // szeroka i wyscielana: rozklada nacisk, wiec ma sens takze na malym psie
    sizes: ["small", "medium", "large"],
    basePrice: 179,
    sizeStep: 15,
    colors: [C.piaskowy, C.granatowy, C.czerwony],
    badges: [],
    category: "non-working",
    type: "nylon",
    width: "1.5",
    idPanelCompatible: false,
    bestsellerRank: 10,
    createdAt: "2025-11-03",
  }),
  collar({
    slug: "havoc-chain-martingale",
    name: "Obroża półzaciskowa Havoc",
    // polzacisk to narzedzie do psa, ktory ciagnie - nie robimy go w rozmiarze malym
    sizes: ["medium", "large"],
    basePrice: 199,
    sizeStep: 20,
    colors: [C.stalowy, C.grafitowy],
    badges: [],
    category: "working",
    type: "chain",
    width: "1",
    idPanelCompatible: false,
    createdAt: "2025-12-01",
  }),
  collar({
    slug: "onyx-slip-chain",
    name: "Obroża zaciskowa Onyx",
    sizes: ["medium", "large"],
    basePrice: 179,
    sizeStep: 15,
    soldOut: ["medium", "large"], // zaden wariant nie jest dostepny -> produkt wyprzedany
    colors: [C.grafitowy],
    badges: ["sold-out"],
    category: "working",
    type: "chain",
    width: "1",
    idPanelCompatible: false,
    createdAt: "2025-05-30",
  }),
  collar({
    slug: "pulse-e-collar-strap",
    name: "Obroża Pulse E-Fit",
    // lekka tasma pod maly modul: konczy sie na srednim, duzy pies dostaje Strike
    sizes: ["small", "medium"],
    basePrice: 149,
    sizeStep: 10,
    colors: [C.czarny, C.czerwony, C.pomaranczowy],
    badges: ["new"],
    category: "e-collar",
    type: "nylon",
    width: "1",
    idPanelCompatible: false,
    createdAt: "2026-06-08",
  }),
  collar({
    slug: "aurora-padded-collar",
    name: "Obroża wyściełana Aurora",
    sizes: ["small", "medium"],
    basePrice: 189,
    sizeStep: 15,
    colors: [C.piaskowy, C.bialy, C.granatowy],
    badges: ["new"],
    category: "non-working",
    type: "nylon",
    width: "1.5",
    idPanelCompatible: false,
    createdAt: "2026-04-22",
  }),
  collar({
    slug: "timber-trail-collar",
    name: "Obroża spacerowa Timber",
    sizes: ["small", "medium", "large"],
    basePrice: 155,
    sizeStep: 15,
    soldOut: ["large"],
    colors: [C.coyote, C.oliwkowy],
    badges: ["last-chance"],
    category: "non-working",
    type: "nylon",
    width: "1.5",
    idPanelCompatible: false,
    createdAt: "2025-03-05",
  }),
  collar({
    slug: "drift-coastal-collar",
    name: "Obroża lekka Drift",
    sizes: ["small", "medium"],
    basePrice: 129,
    sizeStep: 10,
    colors: [C.granatowy, C.piaskowy],
    badges: [],
    category: "non-working",
    type: "nylon",
    width: "1",
    idPanelCompatible: false,
    createdAt: "2025-06-29",
  }),
  collar({
    slug: "cipher-tactical-collar",
    name: "Obroża niskoprofilowa Cipher",
    sizes: ["medium", "large"],
    basePrice: 299,
    sizeStep: 25,
    colors: [C.czarny, C.oliwkowy, C.coyote],
    badges: ["new"],
    category: "working",
    type: "nylon",
    width: "1.75",
    idPanelCompatible: true,
    createdAt: "2026-05-31",
  }),
  collar({
    slug: "ember-reflective-collar",
    name: "Obroża odblaskowa Ember",
    sizes: ["small", "medium"],
    basePrice: 159,
    sizeStep: 10,
    soldOut: ["medium"],
    colors: [C.czerwony, C.pomaranczowy],
    badges: ["last-chance"],
    category: "non-working",
    type: "nylon",
    width: "1",
    idPanelCompatible: false,
    createdAt: "2025-04-18",
  }),
  collar({
    slug: "torque-chain-collar",
    name: "Obroża łańcuszkowa Torque",
    sizes: ["medium", "large"],
    basePrice: 269,
    sizeStep: 25,
    colors: [C.stalowy, C.grafitowy],
    badges: [],
    category: "working",
    type: "chain",
    width: "1.5",
    idPanelCompatible: false,
    createdAt: "2025-09-12",
  }),
  collar({
    slug: "willow-heritage-collar",
    name: "Obroża klasyczna Willow",
    sizes: ["small", "medium"],
    basePrice: 209,
    sizeStep: 15,
    soldOut: ["small", "medium"],
    colors: [C.piaskowy, C.bialy],
    badges: ["sold-out"],
    category: "non-working",
    type: "nylon",
    width: "1",
    idPanelCompatible: false,
    createdAt: "2025-07-07",
  }),
  collar({
    slug: "strike-e-fit-pro-collar",
    name: "Obroża Strike E-Fit Pro",
    sizes: ["medium", "large"],
    basePrice: 339,
    sizeStep: 30,
    colors: [C.czarny, C.coyote],
    badges: [],
    category: "e-collar",
    type: "nylon",
    width: "1.75",
    idPanelCompatible: true,
    createdAt: "2025-10-28",
  }),
  collar({
    slug: "kodiak-duty-collar",
    name: "Obroża całodzienna Kodiak",
    sizes: ["medium", "large"],
    basePrice: 379,
    sizeStep: 30,
    colors: [C.czarny, C.oliwkowy],
    badges: [],
    category: "working",
    type: "nylon",
    width: "1.75",
    idPanelCompatible: true,
    createdAt: "2025-11-20",
  }),
  collar({
    slug: "meadow-soft-collar",
    name: "Obroża miękka Meadow",
    sizes: ["small", "medium"],
    basePrice: 119,
    sizeStep: 10,
    colors: [C.piaskowy, C.granatowy, C.bialy],
    badges: [],
    category: "non-working",
    type: "nylon",
    width: "1",
    idPanelCompatible: false,
    createdAt: "2025-08-25",
  }),
  collar({
    slug: "breeze-mesh-collar",
    name: "Obroża siatkowa Breeze",
    sizes: ["small", "medium", "large"],
    basePrice: 109,
    sizeStep: 10,
    colors: [C.szary, C.granatowy],
    badges: [],
    category: "non-working",
    type: "nylon",
    width: "1",
    idPanelCompatible: false,
    createdAt: "2026-03-14",
  }),
  collar({
    slug: "surge-e-fit-collar",
    name: "Obroża Surge E-Fit",
    sizes: ["small", "medium"],
    basePrice: 229,
    sizeStep: 20,
    soldOut: ["small", "medium"],
    colors: [C.czarny],
    badges: ["sold-out"],
    category: "e-collar",
    type: "nylon",
    width: "1.5",
    idPanelCompatible: true,
    createdAt: "2025-12-19",
  }),
  collar({
    slug: "raptor-e-fit-field-collar",
    name: "Obroża tropiąca Raptor E-Fit",
    sizes: ["medium", "large"],
    basePrice: 249,
    sizeStep: 20,
    soldOut: ["large"],
    colors: [C.oliwkowy, C.czarny],
    badges: [],
    category: "e-collar",
    type: "nylon",
    width: "1.5",
    idPanelCompatible: true,
    createdAt: "2026-02-06",
  }),
];
