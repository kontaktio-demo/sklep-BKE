// Warstwa kolorow shellu (pasek nawigacyjny + stopka). Dwa swiaty:
//   "/"                  -> papier i tusz (pk-*)
//   sklep, /pro, reszta  -> grafit (nf-*)
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

// hover:text-nf-white, nie hover:text-white: nf-white to token MAKSYMALNEGO KONTRASTU
// (tusz na jasnym, biel na ciemnym). Literalna biel dawala bialy napis na jasnym pasku,
// gdy shell ciemny wjezdzal na jasna trase. Wyjatek: text-white na plaskiej czerwieni
// (bg-nf-red) jest poprawne w obu swiatach - czerwien nie odwraca sie razem z tlem.
// BEZ backdrop-blur. Rozmycie tla na PRZYKLEJONYM pasku (i w panelu menu) kaze przegladarce
// przy kazdej klatce przewijania wziac to, co wlasnie przejechalo pod spodem, i rozmyc to
// od nowa - na calej szerokosci okna. To byla stala oplata za sam scroll, placona po to,
// zeby rozmyc tlo, ktore i tak zaslania nieprzezroczysta plaszczyzna (95-98%).
// Tlo jest teraz pelne: wyglada tak samo, kosztuje zero.
export const SHELL: Record<Theme, ShellTheme> = {
  dark: {
    shellSolid: "border-nf-border bg-nf-bg",
    shellTop: "border-transparent bg-transparent",
    iconButton: "text-nf-text hover:text-nf-white",
    cartBadge: "bg-nf-red text-white",
    navLink: "text-nf-text hover:text-nf-white",
    navChevron: "text-nf-dim",
    panel: "border-nf-border bg-nf-bg",
    panelHeading: "text-nf-dim",
    panelLink: "text-nf-muted hover:text-nf-white",
    line: "border-nf-border",
    mobileItem: "text-nf-text",
    field: "border-nf-border bg-nf-elevated text-nf-text placeholder:text-nf-dim",
    chip: "border-nf-border text-nf-muted hover:border-nf-border-strong hover:text-nf-white",
    meta: "text-nf-dim",
  },
  light: {
    shellSolid: "border-pk-line bg-pk-paper",
    shellTop: "border-transparent bg-transparent",
    iconButton: "text-pk-ink-2 hover:text-pk-ink",
    cartBadge: "bg-pk-red text-white",
    navLink: "text-pk-ink-2 hover:text-pk-ink",
    navChevron: "text-pk-ink-muted",
    panel: "border-pk-line bg-pk-paper",
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
  legal: string;
  legalLink: string;
}

// select i globe wypadly razem z martwym selektorem regionu w stopce (patrz lib/nav.ts).
export const FOOTER: Record<Theme, FooterTheme> = {
  dark: {
    // bg-nf-bg, nie bg-nf-black: stopka siedzi w scope data-shell="dark", wiec token
    // tla to juz grafit. Czern robila z niej dziure pod jasnym sklepem.
    shell: "border-nf-border bg-nf-bg",
    line: "border-nf-border",
    lead: "text-nf-muted",
    heading: "text-nf-dim",
    link: "text-nf-muted hover:text-nf-white",
    legal: "text-nf-dim",
    legalLink: "hover:text-nf-muted",
  },
  light: {
    shell: "border-pk-line bg-pk-paper-2",
    line: "border-pk-line",
    lead: "text-pk-ink-2",
    heading: "text-pk-ink-muted",
    link: "text-pk-ink-2 hover:text-pk-ink",
    legal: "text-pk-ink-muted",
    legalLink: "hover:text-pk-ink",
  },
};
