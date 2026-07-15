import Image from "next/image";
import Link from "next/link";
import { photo } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Dwa sklepy jako DWA MATERIALY, nie dwa rowne kafle. Kafel cywilny (7 kolumn,
 * papier, serif) i kafel Pro (5 kolumn, grafit, Archivo) roznia sie wszystkim -
 * szerokoscia, tlem, krojem i linia bazowa (Pro zsuniety w dol). Ta nierownowaga
 * jest komunikatem: to sa osobne swiaty, nie warianty.
 *
 * Karta jest editorialowa: kadr, a POD nim tytul i tekst - zadnych welonow
 * z przyciskiem na zdjeciu. Caly kafel jest linkiem.
 */
const SHORTCUTS = [
  {
    href: "/collections/collars?kategoria=working",
    title: "Robocze",
    lead: "Szerokie taśmy, uchwyt, panel ID.",
    photoName: "robocze.jpg",
    offset: "",
  },
  {
    href: "/collections/collars?kategoria=non-working",
    title: "Codzienne",
    lead: "Lżejsze obroże na spacer i dom.",
    photoName: "codzienne.jpg",
    offset: "lg:mt-12",
  },
  {
    href: "/collections/collars?kategoria=e-collar",
    title: "Pod e-obrożę",
    lead: "Prowadnice i paski pod moduł.",
    photoName: "e-obroza.jpg",
    offset: "lg:mt-4",
  },
];

function EditorialTile({
  href,
  title,
  lead,
  photoName,
  ratio,
  sizes,
  className,
}: {
  href: string;
  title: string;
  lead: string;
  photoName: string;
  ratio: string;
  sizes: string;
  className?: string;
}) {
  const src = photo(photoName);
  return (
    <Link href={href} className={cn("group block", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[2px] border border-nf-border bg-nf-elevated-2",
          ratio
        )}
      >
        {src && (
          <Image
            src={src}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        )}
      </div>
      <h3 className="type-h3 mt-4 text-nf-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-nf-muted">{lead}</p>
      <span className="mt-2 inline-block text-[13px] font-semibold text-nf-white underline decoration-nf-border-strong underline-offset-4 transition-colors duration-250 ease-nf group-hover:decoration-nf-white">
        Zobacz
      </span>
    </Link>
  );
}

export function HomeSeries() {
  const shopSrc = photo("sklep.jpg");
  const proSrc = photo("pro.jpg");

  return (
    <section className="bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
        <p className="type-kicker text-nf-dim">Dwa sklepy, jedna robota</p>
        <h2 className="type-h2 mt-4 max-w-2xl text-nf-white">
          Sklep dla każdego psa. Sekcja Pro dla tych, które pracują w służbie.
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-6">
          {/* swiat cywilny: 7 kolumn, papier */}
          <Link href="/collections/collars" className="group block lg:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2px] border border-nf-border bg-nf-elevated-2">
              {shopSrc && (
                <Image
                  src={shopSrc}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 58vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none"
                />
              )}
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-6">
              <h3 className="type-h1 text-nf-white">Sklep Dog Store</h3>
              <span className="type-meta shrink-0 text-nf-dim">26 modeli</span>
            </div>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-nf-muted">
              Obroże nylonowe i łańcuszkowe dla każdego psa. Filtry po szerokości,
              obwodzie i kolorze, wysyłka w 24 h.
            </p>
          </Link>

          {/* swiat Pro: 5 kolumn, grafit, zsuniety - lamana linia bazowa */}
          <Link
            href="/pro"
            data-shell="dark"
            className="group block rounded-[2px] lg:col-span-5 lg:mt-20"
          >
            <div className="border border-pro-border bg-pro-bg p-3 pb-0 md:p-4 md:pb-0">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[2px]">
                {proSrc && (
                  <Image
                    src={proSrc}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                )}
              </div>
              <div className="px-2 pb-7 pt-6 md:px-3">
                {/* jezyk sekcji Pro w miniaturze: mono-eyebrow, czerwona linia, Archivo */}
                <p className="type-pro-eyebrow text-pro-muted">
                  Dog Store Pro
                  <span aria-hidden="true" className="px-2 text-pro-red">
                    {"//"}
                  </span>
                  Sprzęt służbowy
                </p>
                <span aria-hidden="true" className="mt-4 block h-0.5 w-12 bg-pro-red" />
                <h3 className="type-pro-h2 mt-5 text-pro-white">
                  Patrol, węch, szkolenie
                </h3>
                <p className="type-pro-meta mt-3 max-w-sm text-pro-muted">
                  Uchwyty kontrolne, prowadnice pod moduł, stalowe okucia. Katalog
                  i zapytania ofertowe dla jednostek.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* skroty: trzy kadry o LAMANEJ linii bazowej (offsety), nie rowny rzad */}
        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-6 lg:mt-20">
          {SHORTCUTS.map((tile) => (
            <EditorialTile
              key={tile.href}
              href={tile.href}
              title={tile.title}
              lead={tile.lead}
              photoName={tile.photoName}
              ratio="aspect-[3/2]"
              sizes="(min-width:640px) 33vw, 100vw"
              className={tile.offset}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
