import Image from "next/image";
import Link from "next/link";
import { photo } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Klasyczne hero na zyczenie wlasciciela: pelnoekranowe zdjecie w tle, napis
 * i dwa przyciski. Zero kickerow, metek mono i podpisow pod kadrem.
 *
 * Scrim (gradient od dolu-lewej) stoi POD tekstem, bo naglowek lezy na jasnym,
 * rozmytym polu zdjecia - bez niego biel by znikala. Paralaksa zostaje: kadr
 * z zapasem skali, transform czytany ze scrolla.
 */
const CTA_BASE =
  "inline-flex h-12 items-center rounded-[4px] px-7 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors duration-250 ease-nf motion-reduce:transition-none";

export function HomeHero() {
  const src = photo("hero.jpg");

  return (
    <section className="relative flex min-h-[62vh] items-end overflow-hidden border-b border-nf-border bg-nf-elevated-2 lg:min-h-[86vh]">
      {src && (
        <div data-parallax="0.05" className="absolute inset-0 scale-[1.12]">
          <Image
            src={src}
            alt="Owczarek belgijski malinois w czerwonej obroży"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_center]"
          />
        </div>
      )}
      {/* scrim: czytelnosc bieli na jasnym polu zdjecia */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-14 pt-40 md:px-6 lg:pb-20">
        <h1 className="type-display max-w-[14ch] text-white">
          Sprzęt dla psów, które pracują
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-white/85">
          Obroże nylonowe i łańcuszkowe, szyte w Polsce i testowane przez
          przewodników — zanim trafią do sprzedaży.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/collections/collars"
            className={cn(CTA_BASE, "bg-white text-[#16161a] hover:bg-white/85")}
          >
            Przejdź do sklepu
          </Link>
          <Link
            href="/pro"
            className={cn(CTA_BASE, "border border-white/60 text-white hover:bg-white/10")}
          >
            Dog Store Pro
          </Link>
        </div>
      </div>
    </section>
  );
}
