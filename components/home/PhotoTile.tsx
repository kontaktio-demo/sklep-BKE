import Image from "next/image";
import Link from "next/link";
import { photo } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Kafel wejsciowy: kadr, tytul, jedno zdanie, jeden przycisk. Caly kafel jest linkiem
 * (przycisk jest w srodku wylacznie jako sygnal - nie zagnieżdzamy dwoch linkow).
 *
 * Kafel K9 (tone="dark") niesie material sekcji: grafit, siatka techniczna, pas szrafury.
 * Kafel cywilny stoi na papierze. To ma byc widoczne juz na stronie glownej, bo to sa
 * dwa osobne sklepy, nie dwa filtry tego samego katalogu.
 */
export function PhotoTile({
  href,
  title,
  lead,
  cta,
  photoName,
  tone = "light",
  ratio = "aspect-[4/3]",
  className,
  sizes = "(min-width:1024px) 50vw, 100vw",
}: {
  href: string;
  title: string;
  lead: string;
  cta: string;
  photoName: string;
  tone?: "light" | "dark";
  ratio?: string;
  className?: string;
  sizes?: string;
}) {
  const src = photo(photoName);
  const dark = tone === "dark";

  return (
    <Link
      href={href}
      data-shell={dark ? "dark" : undefined}
      className={cn(
        "group relative block overflow-hidden rounded-[4px] border",
        ratio,
        // Kafel wejsciowy do K9 jest zapowiedzia tamtej tozsamosci: czern #0E0E0E,
        // czerwona linia, monospace. Nie sciagamy tu jednak calego jezyka K9 - to wciaz
        // strona cywilna, wiec kafel ma byc drzwiami, a nie sekcja.
        dark ? "border-k9-border bg-k9-bg" : "border-nf-border bg-nf-elevated-2",
        className
      )}
    >
      {src ? (
        <>
          <Image
            src={src}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
          />

          {/* Welon pod tekstem: tylko dol kadru, zeby zdjecie zostalo zdjeciem. Warstwa
              istnieje WYLACZNIE nad fotografia - bez zdjecia nie ma czego przyciemniac,
              a na jasnym kaflu przygaszala tylko material sklepu. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          />
        </>
      ) : (
        // Brak zdjecia: plaska plaszczyzna materialu. Siatka techniczna i szrafura znikly
        // razem z reszta dekoracji spoza tozsamosci K9 (§6) - zostaje czern i czerwona linia.
        dark && (
          <span
            aria-hidden="true"
            className="absolute left-5 top-5 block h-0.5 w-12 bg-k9-red md:left-7 md:top-7"
          />
        )
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
        {/* Na zdjeciu tekst jest zawsze bialy (welon jest ciemny). Bez zdjecia jedzie
            na tokenie kontrastu, wiec kafel K9 ma biel, a cywilny tusz. */}
        <h3 className={cn("type-h1", src || dark ? "text-white" : "text-nf-white")}>{title}</h3>
        <p
          className={cn(
            "mt-2 max-w-sm text-sm leading-relaxed",
            src || dark ? "text-white/85" : "text-nf-text"
          )}
        >
          {lead}
        </p>
        <span
          className={cn(
            "mt-5 inline-flex h-11 items-center rounded-[4px] px-6 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors duration-250 ease-nf",
            src || dark
              ? "bg-white text-nf-black group-hover:bg-white/85"
              : "bg-nf-white text-nf-bg group-hover:bg-nf-white/85"
          )}
        >
          {cta}
        </span>
      </div>
    </Link>
  );
}
