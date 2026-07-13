import type { Metadata } from "next";
import { SIZE_NAME, SIZE_NECK, SIZE_ORDER, SIZE_WEIGHT } from "@/lib/sizes";
import type { CollarSize } from "@/lib/types";
import { Bullets, InfoHeader, InfoLink, Note, P, Section, Steps } from "../_ui";

export const metadata: Metadata = {
  title: "Tabela rozmiarów",
  description:
    "Jak zmierzyć obwód szyi psa i dobrać rozmiar obroży: Mały 28-36 cm, Średni 38-46 cm, Duży 48-60 cm. Szerokości taśm 2,5 / 4 / 4,5 cm i do jakich psów pasują.",
  alternates: { canonical: "/tabela-rozmiarow" },
};

// Zakresy ida z lib/sizes (tego samego slownika, co karta produktu i filtry). Wczesniej
// ta strona trzymala wlasna kopie i podawala inna wage psa: pies 18 kg byl tu "Maly",
// a na karcie produktu "Sredni". Rasy sa lokalne, bo nie ma ich w slowniku.
const DOGS: Record<CollarSize, string> = {
  small: "Beagle, border collie, cocker spaniel, mniejszy owczarek australijski",
  medium: "Owczarek belgijski malinois, owczarek niemiecki, labrador, boxer",
  large: "Rottweiler, dog niemiecki, cane corso, duży owczarek kaukaski",
};

const SIZES = SIZE_ORDER.map((size) => ({
  name: SIZE_NAME[size],
  neck: SIZE_NECK[size],
  weight: SIZE_WEIGHT[size],
  dogs: DOGS[size],
}));

const WIDTHS: { width: string; use: string }[] = [
  {
    width: "2,5 cm",
    use: "Psy do 20 kg i codzienne noszenie. Lekka, nie przeszkadza przy krótkiej szyi, wystarczy do spaceru i panelu ID.",
  },
  {
    width: "4 cm",
    use: "Psy pracujące 20-40 kg. Rozkłada nacisk przy szarpnięciu, standard do pracy na smyczy i do obroży z uchwytem.",
  },
  {
    width: "4,5 cm",
    use: "Psy powyżej 40 kg i praca na lince. Największy rozkład nacisku, ale wymaga dłuższej szyi - przy krępym psie ociera o żuchwę.",
  },
];

// type-label, nie monospace: kroj maszynowy nalezy do sekcji PAKT-K9, a to jest strona sklepu.
// Liczby w komorkach trzyma tabular-nums, wiec kolumna stoi rowno bez krojow technicznych.
const TH = "type-label px-4 py-3 text-left text-nf-dim";
const TD = "px-4 py-3 text-sm text-nf-text";

export default function SizingPage() {
  return (
    <>
      <InfoHeader
        title="Tabela rozmiarów"
        lead="Obrożę dobiera się do obwodu szyi, nie do wagi psa. Waga w tabeli jest tylko podpowiedzią, bo malinois i labrador o tej samej masie mają inną szyję."
      />

      <Section title="Jak mierzyć">
        <Steps
          items={[
            "Weź krawiecki centymetr. Bez centymetra: owiń szyję sznurkiem, zaznacz miejsce styku i zmierz sznurek linijką.",
            "Mierz w połowie szyi, w miejscu, w którym obroża naprawdę leży: mniej więcej dwa palce za uszami, nad barkiem.",
            "Taśma ma przylegać, ale nie wciskać się w sierść. Nie zaciągaj.",
            "Sprawdź regułę dwóch palców: między taśmą a szyją muszą swobodnie wejść dwa palce ułożone płasko. Jeśli wchodzą trzy, obroża zsunie się przez głowę.",
            "Zapisz wynik w centymetrach i dobierz rozmiar z tabeli. Obwód na granicy dwóch rozmiarów: bierz większy, regulacja go zbierze.",
          ]}
        />
      </Section>

      <Section title="Rozmiary">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse border border-nf-border">
            <caption className="sr-only">
              Rozmiary obroży: obwód szyi, orientacyjna waga psa i typowe rasy
            </caption>
            <thead className="bg-nf-elevated">
              <tr className="border-b border-nf-border">
                <th scope="col" className={TH}>
                  Rozmiar
                </th>
                <th scope="col" className={TH}>
                  Obwód szyi
                </th>
                <th scope="col" className={TH}>
                  Waga psa
                </th>
                <th scope="col" className={TH}>
                  Typowe rasy
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((size) => (
                <tr key={size.name} className="border-b border-nf-border last:border-b-0">
                  <th scope="row" className={`${TD} font-medium`}>
                    {size.name}
                  </th>
                  <td className={`${TD} tabular-nums`}>{size.neck}</td>
                  <td className={`${TD} text-nf-muted`}>{size.weight}</td>
                  <td className={`${TD} text-nf-muted`}>{size.dogs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Waga jest orientacyjna. Decyduje zmierzony obwód szyi: chart o wadze labradora ma
          szyję o dwa rozmiary mniejszą.
        </P>
      </Section>

      <Section title="Szerokość taśmy">
        <P>
          Szerokość dobiera się do siły psa i długości jego szyi. Im szersza taśma, tym
          mniejszy nacisk na centymetr kwadratowy przy szarpnięciu - ale tym mniej swobody
          ruchu głowy.
        </P>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse border border-nf-border">
            <caption className="sr-only">Szerokości taśm i przeznaczenie</caption>
            <thead className="bg-nf-elevated">
              <tr className="border-b border-nf-border">
                <th scope="col" className={TH}>
                  Szerokość
                </th>
                <th scope="col" className={TH}>
                  Do jakich psów
                </th>
              </tr>
            </thead>
            <tbody>
              {WIDTHS.map((item) => (
                <tr key={item.width} className="border-b border-nf-border last:border-b-0">
                  <th
                    scope="row"
                    className={`${TD} whitespace-nowrap font-medium tabular-nums`}
                  >
                    {item.width}
                  </th>
                  <td className={`${TD} text-nf-muted`}>{item.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="E-obroże">
        <P>
          Obwód mierzysz tak samo, ale liczy się jeszcze jedno: elektrody muszą dotykać skóry,
          a nie leżeć na sierści. Pasek e-obroży dopina się ciaśniej niż obrożę codzienną,
          o jeden palec zamiast dwóch.
        </P>
        <Bullets
          items={[
            "Pies z gęstym podszerstkiem: użyj dłuższych elektrod z zestawu albo rozgarnij sierść pod odbiornikiem.",
            "Odbiornik noś z boku szyi, nie na tchawicy. Zmieniaj stronę co kilka godzin.",
            "Nie zostawiaj e-obroży na psie dłużej niż 8 godzin dziennie. Stały ucisk elektrod powoduje odparzenia.",
            "E-obroża nie zastępuje obroży codziennej z panelem ID. To osobny sprzęt do konkretnej pracy.",
            "Zakres regulacji paska podajemy w karcie każdego modułu. Sprawdź go przed zamówieniem.",
          ]}
        />
      </Section>

      <Section title="Rozmiar nie pasuje">
        <Note>
          Pierwszą wymianę rozmiaru w tym samym modelu wysyłamy na nasz koszt. Zgłoszenie i
          procedura:{" "}
          <InfoLink href="/zwroty-i-reklamacje">zwroty i reklamacje</InfoLink>. Masz 60 dni od
          odbioru paczki.
        </Note>
      </Section>
    </>
  );
}
