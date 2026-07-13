import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { cn } from "@/lib/utils";

// Typografia stron informacyjnych. Zamiast klasy "prose" z wtyczki: kilka malych
// komponentow, ktore trzymaja jeden rytm (naglowki, akapity, listy z myslnikiem)
// i nie pozwalaja stronom rozjechac sie miedzy soba.

/** Klasa dla linkow wplecionych w tekst. */
export const INFO_LINK =
  "text-nf-text underline underline-offset-4 transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none";

export function InfoHeader({
  title,
  lead,
  updated,
}: {
  title: string;
  lead?: string;
  updated?: string;
}) {
  return (
    <header className="border-b border-nf-border pb-8">
      <Breadcrumbs items={[{ label: "Strona główna", href: "/" }, { label: title }]} />

      <h1 className="mt-6 font-display text-3xl font-bold uppercase leading-tight tracking-tight text-nf-white md:text-4xl">
        {title}
      </h1>

      {lead && <p className="mt-4 max-w-2xl text-base leading-relaxed text-nf-muted">{lead}</p>}

      {updated && (
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-nf-dim">
          {updated}
        </p>
      )}
    </header>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    // scroll-mt: naglowek jest przyklejony, wiec skok do #serwis z linku w stopce
    // nie moze wsuwac tytulu pod pasek
    <section id={id} className="scroll-mt-28">
      <h2 className="mt-10 font-display text-lg font-bold uppercase tracking-tight text-nf-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mt-4 text-sm leading-relaxed text-nf-muted", className)}>{children}</p>
  );
}

/** Lista z myslnikiem ASCII. Marker jest w tresci wizualnie, ale poza drzewem dostepnosci -
 *  czytnik ekranu i tak oglosi liste punktowana. */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-nf-muted">
          <span aria-hidden="true" className="select-none text-nf-dim">
            -
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Numerowana procedura. Numery w mono, bo to instrukcja, a nie tekst ciagly. */
export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-4 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-nf-muted">
          <span
            aria-hidden="true"
            className="mt-0.5 shrink-0 font-mono text-[11px] tracking-[0.15em] text-nf-dim"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** Pary etykieta - wartosc: dane firmy, kontakty, terminy. */
export function Facts({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="mt-4 divide-y divide-nf-border border-y border-nf-border">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
          <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-nf-dim">
            {row.label}
          </dt>
          <dd className="text-sm leading-relaxed text-nf-text">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Wyrozniona uwaga. Lewa krawedz zamiast tla - bez dodatkowej plamy w ukladzie. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 border-l-2 border-nf-border-strong pl-4">
      <p className="text-sm leading-relaxed text-nf-muted">{children}</p>
    </div>
  );
}

export function InfoLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={INFO_LINK}>
      {children}
    </Link>
  );
}

export function Mail({ address }: { address: string }) {
  return (
    <a href={`mailto:${address}`} className={INFO_LINK}>
      {address}
    </a>
  );
}
