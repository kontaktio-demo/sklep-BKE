export const BRAND = "Dog Store";

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
  { label: "Patrol", href: `${PRO_ROOT}/patrol` },
  { label: "Z uchwytem", href: `${PRO_ROOT}/handle` },
  { label: "Pod moduł", href: `${PRO_ROOT}/e-collar` },
  { label: "Szkolenie", href: `${PRO_ROOT}/training` },
  { label: "Praca węchowa", href: `${PRO_ROOT}/detection` },
];

/** Etykieta pozycji Dog Store Pro w nawigacji - MegaMenu wyroznia ja po niej kolorem linii Pro. */
export const PRO_NAV_LABEL = "Dog Store Pro";

// Menu opisuje sklep, ktory istnieje: katalog cywilny to wylacznie obroze, wiec nie ma tu
// szelek, smyczy ani odziezy. Kazda pozycja prowadzi albo na strone, albo na filtr listy
// (parametry z components/collection/CollectionView.tsx: kategoria, rodzaj, panel, sort).
// Zakladka obiecujaca kategorie, ktorej nie ma, kosztuje wiecej niz jej brak.
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Obroże",
    href: PLP,
    columns: [
      {
        title: "Kategorie",
        links: [
          { label: "Wszystkie obroże", href: PLP },
          { label: "Obroże robocze", href: `${PLP}?kategoria=working` },
          { label: "Obroże codzienne", href: `${PLP}?kategoria=non-working` },
          { label: "Kompatybilne z e-obrożą", href: `${PLP}?kategoria=e-collar` },
        ],
      },
      {
        title: "Rodzaj",
        links: [
          { label: "Nylonowe", href: `${PLP}?rodzaj=nylon` },
          { label: "Łańcuszkowe", href: `${PLP}?rodzaj=chain` },
        ],
      },
      {
        title: "Wyróżnione",
        links: [
          { label: "Bestsellery", href: `${PLP}?sort=best-selling` },
          { label: "Nowości", href: `${PLP}?sort=date-desc` },
          { label: "Z miejscem na panel ID", href: `${PLP}?panel=1` },
          { label: "Dostępne od ręki", href: `${PLP}?dostepnosc=in-stock` },
        ],
      },
    ],
  },
  {
    label: PRO_NAV_LABEL,
    href: PRO_ROOT,
    columns: [
      { title: "Kategorie", links: PRO_LINKS },
      { title: "Linia Pro", links: [{ label: "O linii", href: PRO_ROOT }] },
    ],
  },
  { label: "O nas", href: "/o-nas" },
];

// Pasek nad trescia na /pro*: status linii zamiast promocji sklepu. Bez rotacji - to nie
// jest komunikat sprzedazowy, tylko naglowek katalogu.
// UWAGA: liczby sa statyczne. Seam (lib/data) jest asynchroniczny, a pasek to komponent
// kliencki bez propsow, wiec nie ma tu dostepu do getProCategories/getProProducts. Przy
// zmianie liczby kategorii albo pozycji trzeba ruszyc te stala.
export const PRO_STATUS = {
  line: "Dog Store Pro",
  scope: "5 kategorii, 12 pozycji",
  contactLabel: "Zapytania:",
  contactEmail: "pro@dogstore.pl",
};

export const TRUST_TRIAD = ["2 lata gwarancji", "Wysyłka w 24 h", "60 dni na zwrot"];

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
    title: "Pomoc i kontakt",
    links: [
      { label: "Kontakt", href: "/kontakt" },
      { label: "Dostawa i płatności", href: "/dostawa-i-platnosci" },
      { label: "Zwroty i reklamacje", href: "/zwroty-i-reklamacje" },
      { label: "Tabela rozmiarów", href: "/tabela-rozmiarow" },
    ],
  },
  {
    title: "Serwis i gwarancja",
    links: [
      { label: "2 lata gwarancji", href: "/gwarancja-i-serwis" },
      { label: "Serwis i naprawy", href: "/gwarancja-i-serwis#serwis" },
      { label: "Pielęgnacja produktu", href: "/gwarancja-i-serwis#pielegnacja" },
    ],
  },
  {
    title: "Sklep",
    links: [
      { label: "Obroże", href: PLP },
      { label: "Koszyk", href: "/koszyk" },
    ],
  },
  {
    title: "Firma",
    links: [
      { label: "O nas", href: "/o-nas" },
      { label: "Regulamin", href: "/regulamin" },
      { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
    ],
  },
  {
    title: PRO_NAV_LABEL,
    links: [...PRO_LINKS, { label: "O linii", href: PRO_ROOT }],
  },
];

// Badge z metoda platnosci to deklaracja, nie ozdoba: pasek pokazuje wylacznie to, czym da
// sie u nas zaplacic. Kasy online nie ma, zamowienie idzie mailem, wiec zostaja dwie metody,
// ktore dzialaja: przelew i pobranie. Karty i BLIK wchodza tu razem z kasa online.
export const PAYMENT_METHODS = ["Przelew bankowy", "Za pobraniem"];

// REGIONS usuniete razem z selektorem regionu w stopce: wszystkie ceny sa w zlotowkach,
// a wysylka idzie tylko do Polski i Unii (SHIPPING_OPTIONS). Lista walut obiecywala
// przeliczanie, ktorego nie ma.

export const LEGAL_LINKS: NavLink[] = [
  { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
  { label: "Regulamin", href: "/regulamin" },
  { label: "Reklamacje i zwroty", href: "/zwroty-i-reklamacje" },
];

// ---- handel: progi i koszty ----

/** Prog darmowej dostawy w zl. Jedno zrodlo dla koszyka, paska ogloszen i strony dostawy. */
export const FREE_SHIPPING_THRESHOLD = 299;

/** Najtansza dostawa (paczkomat). Koszyk pokazuje "od tyle", kase wybiera klient przy zamowieniu. */
export const SHIPPING_FROM = 12.99;

export interface ShippingOption {
  carrier: string;
  price: number;
  time: string;
  freeAboveThreshold: boolean;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  { carrier: "Paczkomat InPost", price: 12.99, time: "1-2 dni robocze", freeAboveThreshold: true },
  { carrier: "Kurier InPost", price: 15.99, time: "1-2 dni robocze", freeAboveThreshold: true },
  { carrier: "Kurier za pobraniem", price: 19.99, time: "1-2 dni robocze", freeAboveThreshold: false },
  { carrier: "Kurier, Unia Europejska", price: 39.99, time: "3-6 dni roboczych", freeAboveThreshold: false },
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
