import type { Metadata } from "next";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, P, Section } from "../_ui";

export const metadata: Metadata = {
  title: "O nas",
  description:
    "Dog Store szyje obroże i sprzęt dla psów pracujących. Szwalnia w Krakowie, sprzęt testowany przez przewodników, linia Dog Store Pro dla służb i szkoleniowców.",
  alternates: { canonical: "/o-nas" },
};

export default function AboutPage() {
  return (
    <>
      <InfoHeader
        title="O nas"
        lead="Szyjemy obroże i sprzęt dla psów, które pracują. Firma stoi na jednej zasadzie: sprzęt ma wytrzymać dzień pracy przewodnika, a nie sesję zdjęciową."
      />

      <Section title="Kim jesteśmy">
        <P>
          Dog Store powstał w 2019 roku w Krakowie, w warsztacie, w którym najpierw naprawialiśmy
          cudze obroże. Przez rok widzieliśmy w kółko to samo: pękały klamry z tworzywa,
          rozchodziły się szwy przy pierścieniu, korodowały okucia po zimie z solą na
          chodnikach. Zaczęliśmy szyć własne, żeby te trzy rzeczy wyeliminować.
        </P>
        <P>
          Dziś pracuje u nas dziewięć osób: szwalnia, magazyn i obsługa zamówień. Nie mamy
          działu marketingu i nie zlecamy produkcji na zewnątrz.
        </P>
        <Facts
          rows={[
            { label: "Rok założenia", value: "2019" },
            { label: "Siedziba i szwalnia", value: `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}` },
            { label: "Zespół", value: "9 osób" },
            { label: "Kontakt", value: <Mail address={COMPANY.shopEmail} /> },
          ]}
        />
      </Section>

      <Section title="Skąd wzięła się linia Dog Store Pro">
        <P>
          Pierwsze zamówienie od przewodnika psa służbowego dostaliśmy w 2021 roku. Chodziło
          o obrożę z uchwytem, która nie urwie się przy podnoszeniu psa przez płot. Zrobiliśmy
          jedną sztukę. Po miesiącu odezwała się cała grupa z tej samej jednostki.
        </P>
        <P>
          Okazało się, że sprzęt do pracy ma inne wymagania niż obroża na spacer: uchwyt
          zamiast smyczy, miejsce na moduł e-obroży, oznaczenie widoczne po zmroku, okucia
          o znanej wytrzymałości na zrywanie. Wydzieliliśmy to w osobną linię -{" "}
          <InfoLink href="/pro">Dog Store Pro</InfoLink> - żeby nie mieszać sprzętu służbowego
          z asortymentem sklepu. Kupują z niej jednostki, szkoły przewodników, ratownicy
          i sportowcy z IGP.
        </P>
      </Section>

      <Section title="Jak testujemy sprzęt">
        <Bullets
          items={[
            "Każdy prototyp trafia na trzy miesiące do przewodnika, który używa go w pracy. Nie do domu, do pracy.",
            "Okucia sprawdzamy na maszynie wytrzymałościowej pod obciążeniem statycznym. Klamra, która puszcza poniżej deklarowanej wartości, nie wchodzi do produkcji.",
            "Po sezonie zbieramy sprzęt z powrotem i patrzymy, gdzie przetarła się taśma i który szew się poluzował. To decyduje o kolejnej wersji, nie opinia z ankiety.",
            "Nowe okucie wprowadzamy dopiero, gdy przejdzie testy w dwóch niezależnych jednostkach.",
          ]}
        />
        <P>
          Dlatego katalog rośnie wolno. Model wchodzi do sprzedaży rok po pierwszym szkicu,
          a nie miesiąc.
        </P>
      </Section>

      <Section title="Gdzie i z czego szyjemy">
        <Bullets
          items={[
            "Szyjemy w Krakowie, we własnej szwalni. Nie zlecamy produkcji podwykonawcom.",
            "Taśmy nylonowe 1000D kupujemy w Polsce i w Niemczech. Neopren na wyściółkę: Włochy.",
            "Okucia stalowe i aluminiowe: dostawcy z Niemiec i Włoch, z atestem wytrzymałości.",
            "Nić poliestrowa, szew krzyżowy na wszystkich połączeniach nośnych.",
            "Elektronikę do e-obroży kupujemy gotową od producenta z Unii Europejskiej. Sami projektujemy i szyjemy paski oraz mocowania modułów.",
          ]}
        />
      </Section>

      <Section title="Czego nie robimy">
        <Bullets
          items={[
            "Nie sprzedajemy sprzętu, którego sami nie przetestowaliśmy w pracy z psem.",
            "Nie wypuszczamy kolekcji sezonowych. Kolor dochodzi wtedy, gdy ma sens w terenie, a nie wtedy, gdy jest modny.",
            "Nie ukrywamy składu i pochodzenia materiałów. Są w specyfikacji każdego produktu.",
          ]}
        />
        <P>
          Masz pytanie o materiał, wytrzymałość albo dobór sprzętu do konkretnego zadania:{" "}
          <InfoLink href="/kontakt">napisz do nas</InfoLink>. Zapytania służbowe i szkoleniowe
          obsługujemy pod adresem <Mail address={COMPANY.proEmail} />.
        </P>
      </Section>
    </>
  );
}
