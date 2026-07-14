import { PhotoTile } from "./PhotoTile";

/**
 * Dwa wejscia i trzy skroty. Uklad kafli, nie "przejscie miedzy swiatami" na scrollu:
 * klient ma w jednym rzucie oka zobaczyc, gdzie jest zwykly sklep, a gdzie sekcja
 * sluzbowa, i wejsc tam jednym kliknieciem.
 */
const SHORTCUTS = [
  {
    href: "/collections/collars?kategoria=working",
    title: "Robocze",
    lead: "Szerokie taśmy, uchwyt, panel ID.",
    cta: "Zobacz",
    photoName: "robocze.jpg",
  },
  {
    href: "/collections/collars?kategoria=non-working",
    title: "Codzienne",
    lead: "Lżejsze obroże na spacer i dom.",
    cta: "Zobacz",
    photoName: "codzienne.jpg",
  },
  {
    href: "/collections/collars?kategoria=e-collar",
    title: "Pod e-obrożę",
    lead: "Prowadnice i paski pod moduł.",
    cta: "Zobacz",
    photoName: "e-obroza.jpg",
  },
];

export function HomeSeries() {
  return (
    <section className="bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20">
        <h2 className="type-h2 text-nf-white">Wybierz sklep</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-nf-muted">
          Dog Store Pro ma własny asortyment. Sprzętu z sekcji służbowej nie ma w zwykłym
          sklepie i odwrotnie.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <PhotoTile
            href="/collections/collars"
            title="Sklep Dog Store"
            lead="Obroże nylonowe i łańcuszkowe dla każdego psa. Filtry po szerokości, obwodzie i kolorze. Wysyłka w 24 h."
            cta="Przejdź do sklepu"
            photoName="sklep.jpg"
            ratio="aspect-[4/3] md:aspect-[16/10]"
          />
          <PhotoTile
            href="/pro"
            title="Dog Store Pro"
            lead="Sprzęt służbowy: patrol, praca węchowa, szkolenie. Uchwyty kontrolne, prowadnice pod moduł, stalowe okucia."
            cta="Wejdź do sekcji Dog Store Pro"
            photoName="pro.jpg"
            tone="dark"
            ratio="aspect-[4/3] md:aspect-[16/10]"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SHORTCUTS.map((tile) => (
            <PhotoTile
              key={tile.href}
              {...tile}
              ratio="aspect-[3/2]"
              sizes="(min-width:640px) 33vw, 100vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
