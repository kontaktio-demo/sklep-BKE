import type { Metadata } from "next";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, Note, P, Section, Steps } from "../_ui";

export const metadata: Metadata = {
  title: "Zwroty i reklamacje",
  description:
    "60 dni na zwrot zamiast ustawowych 14. Pierwsza wymiana rozmiaru na nasz koszt. Procedura zwrotu, reklamacja z rękojmi i gwarancji, terminy.",
  alternates: { canonical: "/zwroty-i-reklamacje" },
};

const ADDRESS = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

export default function ReturnsPage() {
  return (
    <>
      <InfoHeader
        title="Zwroty i reklamacje"
        lead="Ustawa daje konsumentowi 14 dni na odstąpienie od umowy. My dajemy 60 dni, bo dobór obroży na psa rzadko wychodzi za pierwszym razem."
      />

      <Section title="Zwrot w 60 dni">
        <P>
          Masz 60 dni od odbioru paczki na odesłanie towaru bez podania przyczyny. Termin
          ustawowy to 14 dni - pozostałe 46 dni to nasza polityka i możesz z niej korzystać
          na tych samych zasadach.
        </P>
        <Bullets
          items={[
            "Obrożę można przymierzyć i sprawdzić na psie w domu.",
            "Nie przyjmujemy zwrotu sprzętu noszonego w terenie: z zabrudzeniami, sierścią wtartą w taśmę, śladami gryzienia, zapachem.",
            "E-obrożę i sprzęt elektroniczny odsyłasz z kompletem: nadajnik, odbiornik, ładowarka, elektrody, opakowanie.",
            "Produkty szyte na wymiar i z indywidualnym oznaczeniem nie podlegają zwrotowi (art. 38 ustawy o prawach konsumenta).",
          ]}
        />
      </Section>

      <Section title="Jak zwrócić">
        <Steps
          items={[
            <>
              Napisz na <Mail address={COMPANY.shopEmail} /> z tematem: Zwrot. W treści podaj
              numer zamówienia, nazwę produktu i numer rachunku do przelewu.
            </>,
            "Odeślemy potwierdzenie przyjęcia zgłoszenia i adres do wysyłki. Zgłoszenie mailem jest jednocześnie oświadczeniem o odstąpieniu od umowy.",
            "Włóż do paczki kartkę z numerem zamówienia. Bez niej nie wiemy, czyja to przesyłka i zwrot się przeciąga.",
            "Wyślij paczkę na adres zwrotów. Nie wysyłaj za pobraniem, takich przesyłek nie odbieramy.",
            "Pieniądze zwracamy do 14 dni od otrzymania paczki, tą samą metodą, którą płaciłeś. Zwracamy też koszt najtańszej dostawy do Ciebie.",
          ]}
        />
        <Facts
          rows={[
            {
              label: "Adres do zwrotów",
              value: (
                <>
                  {COMPANY.returnsRecipient}
                  <br />
                  {ADDRESS}
                </>
              ),
            },
            { label: "Koszt odesłania", value: "Po stronie kupującego" },
            { label: "Zwrot pieniędzy", value: "Do 14 dni od otrzymania paczki" },
          ]}
        />
      </Section>

      <Section title="Wymiana rozmiaru">
        <P>
          Zła długość obroży to najczęstszy powód zwrotu, więc traktujemy ją osobno. Pierwszą
          wymianę rozmiaru w tym samym modelu wysyłamy na nasz koszt: dostajesz mailem etykietę
          zwrotną, odsyłasz starą sztukę, my nadajemy nową po jej odbiorze.
        </P>
        <P>
          Zanim zamówisz wymianę, zmierz psa jeszcze raz według{" "}
          <InfoLink href="/tabela-rozmiarow">tabeli rozmiarów</InfoLink>. Jeśli obwód wypada na
          granicy dwóch rozmiarów, bierz większy - regulacja jest po to, żeby go zebrać.
        </P>
      </Section>

      <Section title="Reklamacja">
        <P>
          Reklamację składasz z rękojmi (2 lata od wydania towaru, odpowiada za nią sprzedawca)
          albo z gwarancji Dog Store (2 lata na szwy i okucia). Wybór należy do Ciebie i jedno nie
          wyklucza drugiego.
        </P>
        <Steps
          items={[
            <>
              Wyślij zgłoszenie na <Mail address={COMPANY.shopEmail} />: numer zamówienia, opis
              wady, zdjęcia uszkodzenia z bliska i całego produktu.
            </>,
            "Odpowiadamy do 14 dni. Brak odpowiedzi w tym terminie oznacza uznanie reklamacji.",
            "Jeśli reklamacja jest zasadna, wysyłamy etykietę zwrotną. Wymieniamy produkt, naprawiamy go albo zwracamy pieniądze.",
            "Koszt wysyłki reklamowanego produktu i odesłania naprawionego pokrywamy my.",
          ]}
        />
        <Note>
          Czego gwarancja nie obejmuje: przegryzienia, przetarcia taśmy od pracy, korozji po
          kąpieli w soli bez wypłukania, cięcia i przeróbek. Szczegóły na stronie{" "}
          <InfoLink href="/gwarancja-i-serwis">gwarancja i serwis</InfoLink>.
        </Note>
      </Section>

      <Section title="Spory">
        <P>
          Jeśli nie dogadamy się bezpośrednio, konsument może skorzystać z pozasądowego
          rozwiązywania sporów: powiatowy rzecznik konsumentów, wojewódzki inspektorat
          Inspekcji Handlowej albo platforma ODR Komisji Europejskiej. Skorzystanie z tych
          dróg jest dobrowolne dla obu stron.
        </P>
      </Section>
    </>
  );
}
