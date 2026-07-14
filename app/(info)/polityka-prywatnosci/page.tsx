import type { Metadata } from "next";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, Note, P, Section } from "../_ui";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Kto jest administratorem danych, jakie dane zbieramy, po co, na jakiej podstawie prawnej, jak długo je trzymamy i jakie masz prawa. Cookies i kontakt w sprawach RODO.",
  alternates: { canonical: "/polityka-prywatnosci" },
};

const ADDRESS = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

export default function PrivacyPage() {
  return (
    <>
      <InfoHeader
        title="Polityka prywatności"
        lead="Zbieramy tyle danych, ile potrzeba, żeby wysłać paczkę, wystawić dokument i odpowiedzieć na wiadomość. Poniżej wprost: co, po co i na jak długo."
        updated="Obowiązuje od 1 lipca 2026 r."
      />

      <Section title="Administrator danych">
        <Facts
          rows={[
            { label: "Administrator", value: COMPANY.legalName },
            { label: "Adres", value: `${ADDRESS}, ${COMPANY.country}` },
            { label: "NIP", value: COMPANY.nip },
            { label: "Kontakt w sprawie danych", value: <Mail address={COMPANY.privacyEmail} /> },
          ]}
        />
        <P>
          Nie powołaliśmy inspektora ochrony danych - nie mamy takiego obowiązku. Wszystkie
          sprawy dotyczące danych osobowych obsługujemy pod adresem {COMPANY.privacyEmail}.
        </P>
      </Section>

      <Section title="Jakie dane zbieramy">
        <Bullets
          items={[
            "Zamówienie: imię i nazwisko, adres dostawy, e-mail, telefon, treść zamówienia. Przy fakturze także nazwa firmy i NIP.",
            "Kontakt: imię, adres e-mail i treść wiadomości, którą wysyłasz do nas pocztą elektroniczną. Formularze na stronie nie przesyłają danych na nasz serwer, tylko przygotowują treść wiadomości po Twojej stronie.",
            "Newsletter: adres e-mail.",
            "Techniczne: adres IP, typ przeglądarki, zdarzenia w sklepie zapisywane w logach serwera.",
            "Płatności: numeru karty nie widzimy i nie przechowujemy. Obsługuje ją operator płatności, my dostajemy tylko status transakcji.",
          ]}
        />
      </Section>

      <Section title="Cele i podstawy prawne">
        <Facts
          rows={[
            {
              label: "Realizacja zamówienia",
              value: "Art. 6 ust. 1 lit. b RODO - wykonanie umowy sprzedaży.",
            },
            {
              label: "Faktury i księgowość",
              value: "Art. 6 ust. 1 lit. c RODO - obowiązek prawny wynikający z przepisów podatkowych.",
            },
            {
              label: "Zwroty i reklamacje",
              value: "Art. 6 ust. 1 lit. c RODO - obowiązki wynikające z ustawy o prawach konsumenta.",
            },
            {
              label: "Newsletter",
              value: "Art. 6 ust. 1 lit. a RODO - zgoda, którą można wycofać w każdej chwili.",
            },
            {
              label: "Odpowiedź na wiadomość",
              value: "Art. 6 ust. 1 lit. a i f RODO - zgoda oraz nasz uzasadniony interes: obsługa zapytania.",
            },
            {
              label: "Dochodzenie roszczeń",
              value: "Art. 6 ust. 1 lit. f RODO - uzasadniony interes administratora.",
            },
          ]}
        />
      </Section>

      <Section title="Komu przekazujemy dane">
        <Bullets
          items={[
            "Przewoźnicy: InPost i firmy kurierskie realizujące dostawę.",
            "Operator płatności: obsługa BLIK, przelewów online, kart i PayPal.",
            "Biuro rachunkowe: księgowanie sprzedaży i archiwizacja dokumentów.",
            "Dostawca hostingu i poczty: przechowywanie danych sklepu i korespondencji.",
            "Organy publiczne, gdy przepis prawa tego wymaga.",
          ]}
        />
        <P>
          Nie sprzedajemy danych i nie udostępniamy ich do celów marketingowych innych firm.
          Nie przekazujemy danych poza Europejski Obszar Gospodarczy.
        </P>
      </Section>

      <Section title="Jak długo trzymamy dane">
        <Bullets
          items={[
            "Dane zamówień i dokumenty księgowe: 5 lat licząc od końca roku, w którym upłynął termin płatności podatku.",
            "Dane potrzebne do obrony przed roszczeniami: do upływu terminu przedawnienia, zwykle 6 lat.",
            "Newsletter: do wycofania zgody.",
            "Korespondencja: 12 miesięcy od zakończenia sprawy.",
            "Logi serwera: 12 miesięcy.",
          ]}
        />
      </Section>

      <Section title="Twoje prawa">
        <Bullets
          items={[
            "Dostęp do danych i otrzymanie ich kopii.",
            "Sprostowanie danych nieprawidłowych i uzupełnienie niepełnych.",
            "Usunięcie danych, o ile nie stoi temu na przeszkodzie obowiązek prawny (na przykład przechowywanie faktur).",
            "Ograniczenie przetwarzania.",
            "Przeniesienie danych do innego administratora.",
            "Sprzeciw wobec przetwarzania opartego na uzasadnionym interesie.",
            "Wycofanie zgody w każdej chwili, bez wpływu na zgodność z prawem przetwarzania sprzed wycofania.",
          ]}
        />
        <P>
          Żądanie zgłaszasz na <Mail address={COMPANY.privacyEmail} />. Odpowiadamy w terminie
          miesiąca. Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych,
          ul. Stawki 2, 00-193 Warszawa.
        </P>
      </Section>

      <Section title="Cookies i pamięć przeglądarki">
        <Bullets
          items={[
            "Niezbędne: utrzymanie sesji i działanie sklepu. Nie wymagają zgody.",
            "Analityczne: statystyka odwiedzin, zbierane wyłącznie za zgodą i tylko w formie zbiorczej.",
            "Marketingowe: nie stosujemy.",
          ]}
        />
        <Note>
          Zawartość koszyka trzymamy w pamięci Twojej przeglądarki (localStorage, klucz
          dogstore-cart-v1). Te dane nie trafiają na nasz serwer i nie są nikomu przekazywane.
          Możesz je usunąć, czyszcząc dane witryny w ustawieniach przeglądarki.
        </Note>
        <P>
          Zgody na cookies analityczne zmienisz w ustawieniach przeglądarki. Zablokowanie
          plików niezbędnych może uniemożliwić złożenie zamówienia.
        </P>
      </Section>

      <Section title="Profilowanie">
        <P>
          Nie podejmujemy decyzji w sposób zautomatyzowany i nie profilujemy klientów. Nie
          budujemy profili zachowań ani nie targetujemy reklam na podstawie Twoich zakupów.
        </P>
      </Section>

      <Section title="Zmiany polityki">
        <P>
          Politykę aktualizujemy, gdy zmienia się zakres usług albo przepisy. Data
          obowiązywania jest podana na górze strony. Zasady zamawiania opisuje{" "}
          <InfoLink href="/regulamin">regulamin</InfoLink>.
        </P>
      </Section>
    </>
  );
}
