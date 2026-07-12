"use client";

// §8-B [NSDW structure; Netflix transparent→solid over the hero]

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
  UserIcon,
} from "@/components/ui/icons";
import { useCart } from "@/lib/cart";
import { BRAND, NAV_ITEMS, TRUST_TRIAD } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { MegaMenu } from "./MegaMenu";

const POPULAR_SEARCHES = ["Obroże robocze", "Odblaskowe", "Łańcuszkowe", "Panele ID"];

const ICON_BUTTON_CLASSES =
  "flex h-11 w-11 items-center justify-center text-nf-text transition-colors duration-250 ease-nf hover:text-white";

function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

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
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
          router.push("/collections/collars");
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
          placeholder="Czego szukasz?"
          className="h-12 w-full rounded-[4px] border border-nf-border bg-nf-elevated px-4 text-sm text-nf-text placeholder:text-nf-dim"
        />
      </form>
      <div className="mt-5">
        <h3 className="text-[11px] uppercase tracking-widest text-nf-dim">
          Popularne wyszukiwania
        </h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <li key={term}>
              <Link
                href="/collections/collars"
                onClick={onClose}
                className="inline-flex h-11 items-center rounded-[4px] border border-nf-border px-3 text-sm text-nf-muted transition-colors duration-250 ease-nf hover:border-nf-border-strong hover:text-white"
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
function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      title="Menu"
      widthClassName={
        /* §8-B: K9TG mobile nav is full-screen; cap the width only from sm upward */
        "max-w-none sm:max-w-sm"
      }
      footer={
        <p className="px-5 py-4 text-[11px] text-nf-dim">{TRUST_TRIAD.join(" · ")}</p>
      }
    >
      <nav aria-label="Nawigacja główna">
        <ul>
          {NAV_ITEMS.map((item) => {
            const columns = item.columns ?? [];
            if (columns.length === 0) {
              return (
                <li key={item.label} className="border-b border-nf-border">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex h-12 items-center px-5 text-sm font-semibold uppercase tracking-wide text-nf-text"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }
            const isExpanded = expanded === item.label;
            return (
              <li key={item.label} className="border-b border-nf-border">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? null : item.label)}
                  className="flex h-12 w-full items-center justify-between px-5 text-sm font-semibold uppercase tracking-wide text-nf-text"
                >
                  {item.label}
                  <ChevronDownIcon
                    className={cn(
                      "text-nf-dim transition-transform duration-250 ease-nf",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="space-y-5 px-5 pb-5">
                    {columns.map((col) => (
                      <div key={col.title}>
                        <h3 className="mb-1 text-[11px] uppercase tracking-widest text-nf-dim">
                          {col.title}
                        </h3>
                        <ul>
                          {col.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                onClick={onClose}
                                className="flex min-h-11 items-center text-sm text-nf-muted transition-colors duration-250 ease-nf hover:text-white"
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

  useEffect(() => {
    // pages with a billboard hero mark it with data-hero-sentinel
    const sentinel = document.querySelector("[data-hero-sentinel]");
    if (!sentinel) {
      setHasHero(false);
      setScrolled(false);
      return;
    }
    setHasHero(true);
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const solid = !hasHero || scrolled;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 ease-nf",
          solid
            ? "border-nf-border bg-nf-bg/95 backdrop-blur"
            : "border-transparent bg-transparent"
        )}
      >
        {/* legibility gradient while transparent over the hero */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 ease-nf",
            solid ? "opacity-0" : "opacity-100"
          )}
        />
        {/* no `relative` here — the mega panel positions against the header */}
        <div className="container mx-auto flex h-16 items-center gap-2 px-4 lg:h-[72px] lg:px-6">
          <button
            type="button"
            aria-label="Otwórz menu"
            onClick={() => setMobileOpen(true)}
            className={cn(ICON_BUTTON_CLASSES, "-ml-2 lg:hidden")}
          >
            <MenuIcon />
          </button>
          <Link
            href="/"
            className="font-display text-2xl font-black uppercase tracking-tight text-nf-red"
          >
            {BRAND}
          </Link>
          <div className="hidden flex-1 justify-center lg:flex">
            <MegaMenu />
          </div>
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button
              type="button"
              aria-label="Szukaj"
              onClick={() => setSearchOpen(true)}
              className={ICON_BUTTON_CLASSES}
            >
              <SearchIcon />
            </button>
            <button type="button" aria-label="Konto" className={ICON_BUTTON_CLASSES}>
              <UserIcon />
            </button>
            <button
              type="button"
              aria-label={count > 0 ? `Otwórz koszyk, ${count} szt.` : "Otwórz koszyk"}
              onClick={openCart}
              className={ICON_BUTTON_CLASSES}
            >
              <span className="relative">
                <CartIcon />
                {count > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-nf-red px-1 text-[10px] font-semibold leading-none text-white"
                  >
                    {count}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </header>

      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} title="Szukaj">
        <SearchPanel onClose={() => setSearchOpen(false)} />
      </Dialog>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
