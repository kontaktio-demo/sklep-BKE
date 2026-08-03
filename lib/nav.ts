export const BRAND = "Dog Store";

// UWAGA i18n: pola `label`/`title` poniżej to KLUCZE słownika w namespace `nav`
// (messages/<locale>/nav.json), nie gotowe teksty. Komponenty tłumaczą je przez
// useTranslations("nav")/getTranslations("nav"). Hrefy i marki są językowo neutralne.
export interface NavLink {
  label: string;
  href: string;
}

export interface NavColumn {
  title: string;
  links: NavLink[];
}

export interface NavItem {
  label: string;
  href: string;
  columns?: NavColumn[];
}

const PLP = "/collections/collars";

/** Korzen sekcji Dog Store Pro. Osobny swiat: ciemna powloka, mono, katalog zamiast sklepu. */
export const PRO_ROOT = "/pro";

/** Powloka (pasek ogloszen, newsletter) zmienia tresc na trasach linii Pro. */
export function isProRoute(pathname: string): boolean {
  return pathname === PRO_ROOT || pathname.startsWith(`${PRO_ROOT}/`);
}

/** Jedno zrodlo linkow do kategorii Pro: nawigacja, stopka i menu mobilne czytaja to samo. */
export const PRO_LINKS: NavLink[] = [
  { label: "cat.patrol", href: `${PRO_ROOT}/patrol` },
  { label: "cat.handle", href: `${PRO_ROOT}/handle` },
  { label: "cat.module", href: `${PRO_ROOT}/e-collar` },
  { label: "cat.training", href: `${PRO_ROOT}/training` },
  { label: "cat.detection", href: `${PRO_ROOT}/detection` },
];

/** Marka linii służbowej (językowo neutralna) — używa jej Logo. W nawigacji pozycja Pro
 *  jest wykrywana po href === PRO_ROOT, nie po etykiecie. */
export const PRO_NAV_LABEL = "Dog Store Pro";

// Menu opisuje sklep, ktory istnieje: katalog cywilny to wylacznie obroze, wiec nie ma tu
// szelek, smyczy ani odziezy. Kazda pozycja prowadzi albo na strone, albo na filtr listy
// (parametry z components/collection/CollectionView.tsx: kategoria, rodzaj, panel, sort).
// Zakladka obiecujaca kategorie, ktorej nie ma, kosztuje wiecej niz jej brak.
export const NAV_ITEMS: NavItem[] = [
  {
    label: "collars",
    href: PLP,
    columns: [
      {
        title: "cat.categories",
        links: [
          { label: "cat.allCollars", href: PLP },
          { label: "cat.working", href: `${PLP}?kategoria=working` },
          { label: "cat.everyday", href: `${PLP}?kategoria=non-working` },
          { label: "cat.eCollar", href: `${PLP}?kategoria=e-collar` },
        ],
      },
      {
        title: "cat.type",
        links: [
          { label: "cat.nylon", href: `${PLP}?rodzaj=nylon` },
          { label: "cat.chain", href: `${PLP}?rodzaj=chain` },
        ],
      },
      {
        title: "cat.featured",
        links: [
          { label: "cat.bestsellers", href: `${PLP}?sort=best-selling` },
          { label: "cat.new", href: `${PLP}?sort=date-desc` },
          { label: "cat.withIdPanel", href: `${PLP}?panel=1` },
          { label: "cat.inStock", href: `${PLP}?dostepnosc=in-stock` },
        ],
      },
    ],
  },
  {
    label: "proLine",
    href: PRO_ROOT,
    columns: [
      { title: "cat.categories", links: PRO_LINKS },
      { title: "cat.proLineCol", links: [{ label: "cat.aboutLine", href: PRO_ROOT }] },
    ],
  },
  { label: "about", href: "/o-nas" },
];

// Pasek nad trescia na /pro*: status linii zamiast promocji sklepu. Bez rotacji - to nie
// jest komunikat sprzedazowy, tylko naglowek katalogu.
// UWAGA: liczby sa statyczne. Seam (lib/data) jest asynchroniczny, a pasek to komponent
// kliencki bez propsow, wiec nie ma tu dostepu do getProCategories/getProProducts. Przy
// zmianie liczby kategorii albo pozycji trzeba ruszyc te stala.
export const PRO_STATUS = {
  line: "Dog Store Pro",
  contactEmail: "pro@dogstore.pl",
};

/** Klucze słownika `common` (t("common"): trust.*). Renderowane w pasku, karcie i koszyku. */
export const TRUST_TRIAD = ["trust.warranty", "trust.shipping24", "trust.returns60"];

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

// Stopka prowadzi wylacznie do stron, ktore istnieja. Pozycje bez strony docelowej
// (FAQ, "Znajdz sklep", "Zostan dystrybutorem", "Zarejestruj produkt", "Kariera",
// "Zrownowazony rozwoj") sa usuniete, a nie zostawione przy href="#": martwy link
// kosztuje wiecej niz jego brak.
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "footer.helpContact",
    links: [
      { label: "footer.contact", href: "/kontakt" },
      { label: "footer.shippingPayments", href: "/dostawa-i-platnosci" },
      { label: "footer.returns", href: "/zwroty-i-reklamacje" },
      { label: "footer.sizeChart", href: "/tabela-rozmiarow" },
    ],
  },
  {
    title: "footer.serviceWarranty",
    links: [
      { label: "footer.warranty2y", href: "/gwarancja-i-serwis" },
      { label: "footer.repairs", href: "/gwarancja-i-serwis#serwis" },
      { label: "footer.care", href: "/gwarancja-i-serwis#pielegnacja" },
    ],
  },
  {
    title: "footer.shop",
    links: [
      { label: "collars", href: PLP },
      { label: "footer.cart", href: "/koszyk" },
    ],
  },
  {
    title: "footer.company",
    links: [
      { label: "about", href: "/o-nas" },
      { label: "footer.terms", href: "/regulamin" },
      { label: "footer.privacy", href: "/polityka-prywatnosci" },
    ],
  },
  {
    title: "proLine",
    links: [...PRO_LINKS, { label: "cat.aboutLine", href: PRO_ROOT }],
  },
];

// Badge z metoda platnosci: pasek pokazuje, czym da sie u nas zaplacic. Platnosc online
// przez Stripe (karta / BLIK / Przelewy24).
// Klucze słownika `common` (payment.*). "Karta"→"Card" po EN; BLIK/Przelewy24 to marki.
export const PAYMENT_METHODS = ["card", "blik", "przelewy24"];

// REGIONS usuniete razem z selektorem regionu w stopce: wszystkie ceny sa w zlotowkach,
// a wysylka idzie tylko do Polski i Unii (SHIPPING_OPTIONS). Lista walut obiecywala
// przeliczanie, ktorego nie ma.

export const LEGAL_LINKS: NavLink[] = [
  { label: "footer.privacy", href: "/polityka-prywatnosci" },
  { label: "footer.terms", href: "/regulamin" },
  { label: "footer.returnsShort", href: "/zwroty-i-reklamacje" },
];

// ---- handel: progi i koszty ----

/** Prog darmowej dostawy w zl. Jedno zrodlo dla koszyka, paska ogloszen i strony dostawy. */
export const FREE_SHIPPING_THRESHOLD = 149;

/** Najtansza dostawa (paczkomat). Koszyk pokazuje "od tyle", kase wybiera klient przy zamowieniu. */
export const SHIPPING_FROM = 16.99;

export interface ShippingOption {
  carrier: string;
  price: number;
  time: string;
  freeAboveThreshold: boolean;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  { carrier: "Paczkomat InPost", price: 16.99, time: "1-2 dni robocze", freeAboveThreshold: true },
  { carrier: "Kurier InPost", price: 29.99, time: "1-2 dni robocze", freeAboveThreshold: true },
];

// ---- dane firmy ----
// Jedno zrodlo dla stron informacyjnych: kontakt, regulamin, polityka prywatnosci, zwroty.

export const COMPANY = {
  legalName: "Dog Store sp. z o.o.",
  street: "ul. Rzemieślnicza 14",
  postalCode: "30-363",
  city: "Kraków",
  country: "Polska",
  nip: "676-259-84-30",
  regon: "367124858",
  krs: "0000875412",
  court:
    "Sąd Rejonowy dla Krakowa-Śródmieścia w Krakowie, XI Wydział Gospodarczy Krajowego Rejestru Sądowego",
  shareCapital: "50 000 zł",
  shopEmail: "sklep@dogstore.pl",
  proEmail: "pro@dogstore.pl",
  privacyEmail: "iod@dogstore.pl",
  phone: "+48 12 340 55 20",
  officeHours: "poniedziałek - piątek, 9:00 - 17:00",
  responseTime: "do 24 godzin w dni robocze",
  /** Adres do zwrotow i serwisu. Ten sam budynek co siedziba, ale inny odbiorca na paczce. */
  returnsRecipient: "Dog Store sp. z o.o. - zwroty",
};
