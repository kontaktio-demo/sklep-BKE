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

// mega-menu: NSDW's For Dogs / For Humans / Activities columns,
// with K9TG's category depth inside "Dla psa" (§8-B)
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dla psa",
    href: PLP,
    columns: [
      {
        title: "Kategorie",
        links: [
          { label: "Obroże", href: PLP },
          { label: "Szelki", href: "#" },
          { label: "Smycze", href: "#" },
          { label: "E-obroże", href: "#" },
          { label: "Panele ID", href: "#" },
          { label: "Trening", href: "#" },
        ],
      },
      {
        title: "Obroże",
        links: [
          { label: "Wszystkie obroże", href: PLP },
          { label: "Obroże robocze", href: PLP },
          { label: "Obroże codzienne", href: PLP },
          { label: "Kompatybilne z e-obrożą", href: PLP },
          { label: "Obroże łańcuszkowe", href: PLP },
        ],
      },
      {
        title: "Wyróżnione",
        links: [
          { label: "Bestsellery", href: PLP },
          { label: "Nowości", href: PLP },
          { label: "Ostatnia szansa", href: PLP },
        ],
      },
    ],
  },
  {
    label: "Dla przewodnika",
    href: "#",
    columns: [
      {
        title: "Wyposażenie",
        links: [
          { label: "Saszetki na przysmaki", href: "#" },
          { label: "Pasy", href: "#" },
          { label: "Odzież", href: "#" },
        ],
      },
      {
        title: "W terenie",
        links: [
          { label: "Akcesoria do smyczy", href: "#" },
          { label: "Plecaki terenowe", href: "#" },
        ],
      },
    ],
  },
  {
    label: "Aktywności",
    href: "#",
    columns: [
      {
        title: "Według aktywności",
        links: [
          { label: "Pies pracujący", href: PLP },
          { label: "Na co dzień", href: PLP },
          { label: "Wędrówki", href: "#" },
          { label: "Widoczność nocą", href: PLP },
        ],
      },
    ],
  },
  { label: "O nas", href: "#" },
];

export const ANNOUNCEMENTS = [
  { text: "WYSYŁKA W 24 H W DNI ROBOCZE", highlight: "24 H" },
  { text: "DARMOWA DOSTAWA OD 299 ZŁ", highlight: "299 ZŁ" },
  { text: "60 DNI NA ZWROT I DOBÓR ROZMIARU", highlight: "60 DNI" },
];

export const TRUST_TRIAD = ["2 lata gwarancji", "Wysyłka w 24 h", "60 dni na zwrot"];

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Pomoc i kontakt",
    links: [
      { label: "Kontakt", href: "#" },
      { label: "Dostawa", href: "#" },
      { label: "Zwroty i wymiany", href: "#" },
      { label: "Tabela rozmiarów", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Serwis i gwarancja",
    links: [
      { label: "2 lata gwarancji", href: "#" },
      { label: "Pielęgnacja produktu", href: "#" },
      { label: "Naprawy", href: "#" },
      { label: "Zarejestruj produkt", href: "#" },
    ],
  },
  {
    title: "Gdzie kupić",
    links: [
      { label: "Sklep online", href: PLP },
      { label: "Znajdź sklep", href: "#" },
      { label: "Zostań dystrybutorem", href: "#" },
    ],
  },
  {
    title: "O nas",
    links: [
      { label: "Nasza historia", href: "#" },
      { label: "Program psów pracujących", href: "#" },
      { label: "Zrównoważony rozwój", href: "#" },
      { label: "Kariera", href: "#" },
    ],
  },
];

export const PAYMENT_METHODS = [
  "BLIK",
  "Przelewy24",
  "Visa",
  "Mastercard",
  "PayPal",
  "Apple Pay",
  "Klarna",
];

export const REGIONS = [
  "Polska (PLN zł)",
  "Unia Europejska (EUR €)",
  "Wielka Brytania (GBP £)",
  "Stany Zjednoczone (USD $)",
  "Czechy (CZK Kč)",
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Polityka prywatności", href: "#" },
  { label: "Regulamin", href: "#" },
  { label: "Reklamacje i zwroty", href: "#" },
];
