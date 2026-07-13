// Warstwa kolorow shellu (pasek nawigacyjny + stopka). Dwa swiaty:
//   "/"                  -> papier i tusz (pk-*)
//   sklep, /k9, reszta   -> grafit (nf-*)
// Tutaj sa tylko slowniki klas; skladamy je przez cn() w miejscu uzycia,
// zeby struktura i logika komponentow zostala bez zmian.

export type Theme = "light" | "dark";

export interface ShellTheme {
  /** pasek przyklejony nad trescia (po przewinieciu albo gdy strona nie ma hero) */
  shellSolid: string;
  /** pasek na szczycie strony - lezy na hero, wiec bez tla */
  shellTop: string;
  iconButton: string;
  cartBadge: string;
  navLink: string;
  navChevron: string;
  /** rozwijany panel mega-menu */
  panel: string;
  panelHeading: string;
  panelLink: string;
  /** linie pozycji w nawigacji mobilnej */
  line: string;
  mobileItem: string;
  /** pole wyszukiwarki */
  field: string;
  /** pigulki popularnych fraz */
  chip: string;
  /** drobny tekst pomocniczy */
  meta: string;
}

export const SHELL: Record<Theme, ShellTheme> = {
  dark: {
    shellSolid: "border-nf-border bg-nf-bg/95 backdrop-blur",
    shellTop: "border-transparent bg-transparent",
    iconButton: "text-nf-text hover:text-white",
    cartBadge: "bg-nf-red text-white",
    navLink: "text-nf-text hover:text-white",
    navChevron: "text-nf-dim",
    panel: "border-nf-border bg-nf-bg/98 backdrop-blur",
    panelHeading: "text-nf-dim",
    panelLink: "text-nf-muted hover:text-white",
    line: "border-nf-border",
    mobileItem: "text-nf-text",
    field: "border-nf-border bg-nf-elevated text-nf-text placeholder:text-nf-dim",
    chip: "border-nf-border text-nf-muted hover:border-nf-border-strong hover:text-white",
    meta: "text-nf-dim",
  },
  light: {
    shellSolid: "border-pk-line bg-pk-paper/90 backdrop-blur",
    shellTop: "border-transparent bg-transparent",
    iconButton: "text-pk-ink-2 hover:text-pk-ink",
    cartBadge: "bg-pk-red text-white",
    navLink: "text-pk-ink-2 hover:text-pk-ink",
    navChevron: "text-pk-ink-muted",
    panel: "border-pk-line bg-pk-paper/98 backdrop-blur",
    panelHeading: "text-pk-ink-muted",
    panelLink: "text-pk-ink-2 hover:text-pk-ink",
    line: "border-pk-line",
    mobileItem: "text-pk-ink",
    field:
      "border-pk-line-strong bg-pk-paper-2 text-pk-ink placeholder:text-pk-ink-muted",
    chip: "border-pk-line text-pk-ink-2 hover:border-pk-line-strong hover:text-pk-ink",
    meta: "text-pk-ink-muted",
  },
};

export interface FooterTheme {
  shell: string;
  line: string;
  lead: string;
  heading: string;
  link: string;
  select: string;
  globe: string;
  legal: string;
  legalLink: string;
}

export const FOOTER: Record<Theme, FooterTheme> = {
  dark: {
    shell: "border-nf-border bg-nf-black",
    line: "border-nf-border",
    lead: "text-nf-muted",
    heading: "text-nf-dim",
    link: "text-nf-muted hover:text-white",
    select: "border-nf-border bg-nf-elevated text-nf-text",
    globe: "text-nf-dim",
    legal: "text-nf-dim",
    legalLink: "hover:text-nf-muted",
  },
  light: {
    shell: "border-pk-line bg-pk-paper-2",
    line: "border-pk-line",
    lead: "text-pk-ink-2",
    heading: "text-pk-ink-muted",
    link: "text-pk-ink-2 hover:text-pk-ink",
    select: "border-pk-line-strong bg-pk-paper text-pk-ink",
    globe: "text-pk-ink-muted",
    legal: "text-pk-ink-muted",
    legalLink: "hover:text-pk-ink",
  },
};
