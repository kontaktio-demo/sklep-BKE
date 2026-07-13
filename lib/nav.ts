export const BRAND = "PAKT";

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

/** Korzen sekcji PAKT-K9. Osobny swiat: ciemna powloka, mono, katalog zamiast sklepu. */
export const K9_ROOT = "/k9";

/** Powloka (pasek ogloszen, newsletter) zmienia tresc na trasach linii K9. */
export function isK9Route(pathname: string): boolean {
  return pathname === K9_ROOT || pathname.startsWith(`${K9_ROOT}/`);
}

/** Jedno zrodlo linkow do kategorii K9: nawigacja, stopka i menu mobilne czytaja to samo. */
export const K9_LINKS: NavLink[] = [
  { label: "Patrol", href: `${K9_ROOT}/patrol` },
  { label: "Z uchwytem", href: `${K9_ROOT}/handle` },
  { label: "Pod moduł", href: `${K9_ROOT}/e-collar` },
  { label: "Szkolenie", href: `${K9_ROOT}/training` },
  { label: "Praca węchowa", href: `${K9_ROOT}/detection` },
];

/** Etykieta pozycji K9 w nawigacji - MegaMenu wyroznia ja po niej kolorem linii K9. */
export const K9_NAV_LABEL = "PAKT-K9";

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
    label: K9_NAV_LABEL,
    href: K9_ROOT,
    columns: [
      { title: "Kategorie", links: K9_LINKS },
      { title: "Linia K9", links: [{ label: "O linii", href: K9_ROOT }] },
    ],
  },
  { label: "O nas", href: "/o-nas" },
];

export const ANNOUNCEMENTS = [
  { text: "WYSYŁKA W 24 H W DNI ROBOCZE", highlight: "24 H" },
  { text: "DARMOWA DOSTAWA OD 299 ZŁ", highlight: "299 ZŁ" },
  { text: "60 DNI NA ZWROT I DOBÓR ROZMIARU", highlight: "60 DNI" },
];

// Pasek nad trescia na /k9*: status linii zamiast promocji sklepu. Bez rotacji - to nie
// jest komunikat sprzedazowy, tylko naglowek katalogu.
// UWAGA: liczby sa statyczne. Seam (lib/data) jest asynchroniczny, a pasek to komponent
// kliencki bez propsow, wiec nie ma tu dostepu do getK9Categories/getK9Products. Przy
// zmianie liczby kategorii albo pozycji trzeba ruszyc te stala.
export const K9_STATUS = {
  line: "PAKT-K9",
  scope: "5 kategorii / 12 pozycji",
  contactLabel: "Zapytania:",
  contactEmail: "k9@pakt.pl",
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
    title: K9_NAV_LABEL,
    links: [...K9_LINKS, { label: "O linii", href: K9_ROOT }],
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
  legalName: "PAKT sp. z o.o.",
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
  shopEmail: "sklep@pakt.pl",
  k9Email: "k9@pakt.pl",
  privacyEmail: "iod@pakt.pl",
  phone: "+48 12 340 55 20",
  officeHours: "poniedziałek - piątek, 9:00 - 17:00",
  responseTime: "do 24 godzin w dni robocze",
  /** Adres do zwrotow i serwisu. Ten sam budynek co siedziba, ale inny odbiorca na paczce. */
  returnsRecipient: "PAKT sp. z o.o. - zwroty",
};
