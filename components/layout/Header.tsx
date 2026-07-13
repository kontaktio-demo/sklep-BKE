"use client";

// §8-B [NSDW structure; Netflix transparent->solid over the hero]
// Shell chodzi w dwoch motywach: "/" = papier i tusz, reszta (sklep, /k9) = grafit.
// Kolory siedza w slowniku SHELL - struktura i logika komponentow zostaja te same.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Drawer } from "@/components/ui/Drawer";
import {
  CartIcon,
  ChevronDownIcon,
  MenuIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { useCart } from "@/lib/cart";
import { NAV_ITEMS, TRUST_TRIAD } from "@/lib/nav";
import { POPULAR_SEARCHES, searchHref } from "@/lib/search";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { SHELL, type Theme } from "./theme";
import { isDarkRoute } from "./ThemeSync";

const ICON_BUTTON_BASE =
  "flex h-11 w-11 items-center justify-center transition-colors duration-250 ease-nf";

// Monospace nalezy do swiata K9. Nakladki shellu (wyszukiwarka, menu mobilne) niosa
// nawigacje sklepu cywilnego, wiec drobne naglowki ida groteskiem.
const PANEL_HEADING = "type-label";

function SearchPanel({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const t = SHELL[theme];
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const [query, setQuery] = useState("");

  useEffect(() => {
    // the overlay hook focuses the dialog's first focusable (the close button)
    // after mount; reclaim focus for the input on the next frame
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="p-5">
      <form
        role="search"
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const phrase = query.trim();
          // pusta fraza nie ma dokad prowadzic - panel zostaje otwarty
          if (!phrase) return;
          onClose();
          router.push(searchHref(phrase));
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Czego szukasz?
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Czego szukasz?"
          className={cn(
            "h-12 min-w-0 flex-1 rounded-[2px] border px-4 text-sm",
            t.field
          )}
        />
        <Button type="submit" className="h-12 shrink-0">
          Szukaj
        </Button>
      </form>
      <div className="mt-5">
        <h3 className={cn(PANEL_HEADING, t.meta)}>Popularne wyszukiwania</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <li key={term}>
              <Link
                href={searchHref(term)}
                onClick={onClose}
                className={cn(
                  "inline-flex h-11 items-center rounded-[2px] border px-3 text-sm transition-colors duration-250 ease-nf",
                  t.chip
                )}
              >
                {term}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// K9TG mobile pattern: slide-in nav with expandable submenus
function MobileNav({
  open,
  theme,
  onClose,
}: {
  open: boolean;
  theme: Theme;
  onClose: () => void;
}) {
  const t = SHELL[theme];
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      title="Menu"
      theme={theme}
      widthClassName={
        /* §8-B: K9TG mobile nav is full-screen; cap the width only from sm upward */
        "max-w-none sm:max-w-sm"
      }
      footer={<p className={cn("px-5 py-4 text-xs", t.meta)}>{TRUST_TRIAD.join(" · ")}</p>}
    >
      <nav aria-label="Nawigacja główna">
        <ul>
          {NAV_ITEMS.map((item) => {
            const columns = item.columns ?? [];
            if (columns.length === 0) {
              return (
                <li key={item.label} className={cn("border-b", t.line)}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex h-12 items-center px-5 text-sm font-semibold uppercase tracking-wide",
                      t.mobileItem
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }
            const isExpanded = expanded === item.label;
            return (
              <li key={item.label} className={cn("border-b", t.line)}>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? null : item.label)}
                  className={cn(
                    "flex h-12 w-full items-center justify-between px-5 text-sm font-semibold uppercase tracking-wide",
                    t.mobileItem
                  )}
                >
                  {item.label}
                  <ChevronDownIcon
                    className={cn(
                      "transition-transform duration-250 ease-nf",
                      t.navChevron,
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="space-y-5 px-5 pb-5">
                    {columns.map((col) => (
                      <div key={col.title}>
                        <h3 className={cn(PANEL_HEADING, "mb-1", t.panelHeading)}>{col.title}</h3>
                        <ul>
                          {col.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                onClick={onClose}
                                className={cn(
                                  "flex min-h-11 items-center text-sm transition-colors duration-250 ease-nf",
                                  t.panelLink
                                )}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </Drawer>
  );
}

export function Header() {
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const [hasHero, setHasHero] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ciemna wyspa (kafel wejsciowy K9) potrafi wjechac pod pasek na jasnej trasie.
  // Probkujemy, co faktycznie lezy pod headerem, i przelaczamy motyw - inaczej jasny
  // pasek zostaje na graficie i wyglada jak bug.
  const [overDark, setOverDark] = useState(false);
  const inK9 = isDarkRoute(pathname);
  const routeLight = !inK9;
  const light = routeLight && !overDark;
  const theme: Theme = light ? "light" : "dark";
  const t = SHELL[theme];

  // Nakladki (wyszukiwarka, menu mobilne) otwieraja sie na srodku ekranu, a nie na tresci
  // pod paskiem - ich motyw ma wynikac z TRASY, nie z tego, co akurat wjechalo pod header.
  // Inaczej przewiniecie do ciemnej wyspy na jasnym sklepie robilo z nich grafit bez powodu.
  const overlayTheme: Theme = inK9 ? "dark" : "light";

  useEffect(() => {
    // strony z pelnoekranowym hero oznaczaja go przez data-hero-sentinel
    const sentinel = document.querySelector("[data-hero-sentinel]");
    const hero = sentinel !== null;
    setHasHero(hero);
    // Sklep cywilny: pasek jest zawsze pelny i jasny, jak w sklepie z referencji.
    // Przezroczysty pasek nad zdjeciem zostaje wylacznie w K9.
    if (!isDarkRoute(pathname)) {
      setScrolled(false);
      return;
    }
    if (!hero) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (!routeLight) {
      setOverDark(false);
      return;
    }

    let frame = 0;
    const sample = () => {
      frame = 0;
      const header = document.querySelector("header");
      const y = (header?.getBoundingClientRect().height ?? 64) + 4;
      const xs = [window.innerWidth * 0.15, window.innerWidth * 0.5, window.innerWidth * 0.85];
      const dark = xs.some((x) =>
        document
          .elementsFromPoint(x, y)
          .some(
            (el) =>
              el instanceof HTMLElement &&
              el.dataset.shell === "dark" &&
              // pasek sam nosi teraz data-shell="dark" (zakres tokenow), a przy niezwinietym
              // pasku ogloszen probka wypada w jego wnetrzu. Bez tego wykluczenia header
              // wykrywalby samego siebie i juz nigdy nie wrocilby do jasnego.
              !header?.contains(el)
          )
      );
      setOverDark(dark);
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [routeLight, pathname]);

  // jasne trasy: zawsze pelny pasek. K9: przezroczysty nad hero, pelny po przewinieciu.
  const solid = routeLight ? true : !hasHero || scrolled;

  return (
    <>
      <header
        // Bez tego pasek nakladal klasy ciemnego shellu (nf-*), lezac POZA jakimkolwiek
        // zakresem odwracajacym tokeny: nad ciemna wyspa zostawal jasny, a hover na
        // nf-white dawal tusz na tusz. data-shell="dark" otwiera ten zakres.
        // Regula [data-shell="dark"] siedzi w @layer base, wiec klasy uzytkowe
        // (bg-transparent nad hero K9) nadal ja przebijaja.
        data-shell={theme === "dark" ? "dark" : undefined}
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 ease-nf",
          solid ? t.shellSolid : t.shellTop
        )}
      >
        {/* legibility gradient while transparent over the hero - tylko ciemne trasy;
            na papierze nie ma czego rozjaśniać, a czarny welon by go pobrudził */}
        {!light && (
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 ease-nf",
              solid ? "opacity-0" : "opacity-100"
            )}
          />
        )}
        {/* no `relative` here - the mega panel positions against the header */}
        {/* ta sama siatka co tresc stron: mx-auto max-w-[1600px] px-4 md:px-6.
            Stary "container" mial skokowy max-width (40/48/64/80/96rem), wiec powyzej
            1536px logo stalo w innym miejscu niz tresc pod naglowkiem. */}
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-2 px-4 md:px-6 lg:h-[72px]">
          <button
            type="button"
            aria-label="Otwórz menu"
            onClick={() => setMobileOpen(true)}
            className={cn(ICON_BUTTON_BASE, t.iconButton, "-ml-2 lg:hidden")}
          >
            <MenuIcon />
          </button>
          <Logo onDark={!light} />
          {inK9 && (
            <span className="type-meta flex shrink-0 items-center gap-2 pl-1 text-nf-red-bright">
              <span aria-hidden="true" className="h-3 w-px bg-nf-border-strong" />
              <span className="sr-only">Sekcja </span>K9
            </span>
          )}

          <div className="hidden flex-1 justify-center lg:flex">
            <MegaMenu theme={theme} />
          </div>
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button
              type="button"
              aria-label="Szukaj"
              onClick={() => setSearchOpen(true)}
              className={cn(ICON_BUTTON_BASE, t.iconButton)}
            >
              <SearchIcon />
            </button>
            {/* Ikony konta tu nie ma: w sklepie nie ma logowania ani strony konta, wiec
                przycisk obiecywalby funkcje, ktora nie istnieje. Wroci razem z kontami. */}
            <button
              type="button"
              aria-label={count > 0 ? `Otwórz koszyk, ${count} szt.` : "Otwórz koszyk"}
              onClick={openCart}
              className={cn(ICON_BUTTON_BASE, t.iconButton)}
            >
              <span className="relative">
                <CartIcon />
                {count > 0 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none",
                      t.cartBadge
                    )}
                  >
                    {count}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </header>

      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Szukaj"
        theme={overlayTheme}
      >
        <SearchPanel theme={overlayTheme} onClose={() => setSearchOpen(false)} />
      </Dialog>

      <MobileNav
        open={mobileOpen}
        theme={overlayTheme}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}
