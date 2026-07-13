import type { Metadata } from "next";
import { COMPANY, FREE_SHIPPING_THRESHOLD } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, P, Section } from "../_ui";

export const metadata: Metadata = {
  title: "Regulamin",
  description:
    "Regulamin sklepu PAKT: strony umowy, składanie zamówień, ceny, płatności, dostawa, odstąpienie od umowy, reklamacje, dane osobowe.",
  alternates: { canonical: "/regulamin" },
};

const ADDRESS = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

export default function TermsPage() {
  return (
    <>
      <InfoHeader
        title="Regulamin"
        lead="Regulamin sklepu internetowego pakt.pl. Określa zasady sprzedaży, dostawy, odstąpienia od umowy i reklamacji."
        updated="Obowiązuje od 1 lipca 2026 r."
      />

      <Section title="1. Sprzedawca">
        <Facts
          rows={[
            { label: "Sprzedawca", value: COMPANY.legalName },
            { label: "Siedziba", value: `${ADDRESS}, ${COMPANY.country}` },
            { label: "NIP", value: COMPANY.nip },
            { label: "REGON", value: COMPANY.regon },
            { label: "KRS", value: `${COMPANY.krs}, ${COMPANY.court}` },
            { label: "Kapitał zakładowy", value: `${COMPANY.shareCapital}, wpłacony w całości` },
            { label: "Kontakt", value: <Mail address={COMPANY.shopEmail} /> },
            { label: "Telefon", value: COMPANY.phone },
          ]}
        />
      </Section>

      <Section title="2. Definicje">
        <Bullets
          items={[
            "Sklep - serwis internetowy pakt.pl prowadzony przez Sprzedawcę.",
            "Klient - osoba fizyczna, prawna lub jednostka organizacyjna składająca zamówienie.",
            "Konsument - osoba fizyczna dokonująca zakupu w celu niezwiązanym bezpośrednio z jej działalnością gospodarczą lub zawodową.",
            "Przedsiębiorca na prawach konsumenta - osoba fizyczna prowadząca działalność gospodarczą, dla której zakup nie ma charakteru zawodowego. Przysługują jej te same uprawnienia co Konsumentowi w zakresie odstąpienia od umowy i rękojmi.",
            "Zamówienie - oświadczenie woli Klienta zmierzające do zawarcia umowy sprzedaży.",
          ]}
        />
      </Section>

      <Section title="3. Zamówienia">
        <P>
          Zamówienie składa się przez koszyk w Sklepie. Klient wybiera produkty, sposób
          dostawy i płatności, podaje dane do wysyłki i potwierdza zamówienie z obowiązkiem
          zapłaty.
        </P>
        <Bullets
          items={[
            "Po złożeniu zamówienia Klient dostaje e-mail z potwierdzeniem przyjęcia i podsumowaniem. Ten e-mail oznacza zawarcie umowy sprzedaży.",
            "Umowa jest zawierana w języku polskim.",
            "Sprzedawca może odmówić realizacji zamówienia, jeśli dane są niepełne lub błędne, a kontakt z Klientem jest niemożliwy. Wpłaconą kwotę zwraca wtedy w całości.",
            "Informacje o produktach w Sklepie są zaproszeniem do zawarcia umowy, nie ofertą w rozumieniu Kodeksu cywilnego.",
          ]}
        />
      </Section>

      <Section title="4. Ceny">
        <Bullets
          items={[
            "Ceny podane są w złotych polskich i zawierają podatek VAT w stawce 23 procent.",
            "Cena nie zawiera kosztu dostawy. Koszt dostawy Klient widzi przed potwierdzeniem zamówienia.",
            <>
              Zamówienia o wartości od {FREE_SHIPPING_THRESHOLD} zł objęte są bezpłatną
              dostawą na zasadach opisanych w{" "}
              <InfoLink href="/dostawa-i-platnosci">dostawie i płatnościach</InfoLink>.
            </>,
            "Wiążąca jest cena z chwili złożenia zamówienia. Późniejsza zmiana cennika nie ma wpływu na zamówienia już przyjęte.",
            "Do każdego zamówienia dołączamy dowód sprzedaży. Faktura na dane firmy wymaga podania NIP przy składaniu zamówienia.",
          ]}
        />
      </Section>

      <Section title="5. Płatności">
        <Bullets
          items={[
            "Dostępne metody: BLIK, szybki przelew Przelewy24, karta płatnicza, PayPal, przelew tradycyjny, płatność przy odbiorze.",
            "Płatności elektroniczne obsługuje zewnętrzny operator. Sprzedawca nie przechowuje danych kart płatniczych.",
            "Przy przelewie tradycyjnym Klient ma 7 dni na wpłatę. Po tym terminie zamówienie zostaje anulowane bez skutków dla Klienta.",
            "Zamówienie realizujemy po zaksięgowaniu wpłaty, a przy płatności za pobraniem - po potwierdzeniu zamówienia.",
          ]}
        />
      </Section>

      <Section title="6. Dostawa">
        <Bullets
          items={[
            "Wysyłamy na terenie Polski i do krajów Unii Europejskiej.",
            "Zamówienia opłacone do 14:00 w dni robocze nadajemy tego samego dnia, pozostałe w następnym dniu roboczym.",
            "Czas dostawy zależy od przewoźnika. Terminy i koszty są podane w zakładce dostawy.",
            "Ryzyko przypadkowej utraty towaru przechodzi na Konsumenta z chwilą wydania mu przesyłki przez przewoźnika.",
          ]}
        />
      </Section>

      <Section title="7. Odstąpienie od umowy">
        <P>
          Konsument i przedsiębiorca na prawach konsumenta może odstąpić od umowy w terminie
          14 dni od odbioru towaru, bez podania przyczyny. Sprzedawca wydłuża ten termin
          umownie do 60 dni od odbioru.
        </P>
        <Bullets
          items={[
            "Oświadczenie o odstąpieniu wystarczy wysłać e-mailem na adres sklepu przed upływem terminu.",
            "Towar należy odesłać w ciągu 14 dni od złożenia oświadczenia. Koszt odesłania pokrywa Klient.",
            "Sprzedawca zwraca cenę towaru i koszt najtańszej oferowanej dostawy w ciągu 14 dni od otrzymania zwrotu, tą samą metodą płatności.",
            "Prawo odstąpienia nie przysługuje przy towarach wykonanych na indywidualne zamówienie, w tym z oznaczeniem na wymiar (art. 38 ustawy o prawach konsumenta).",
            "Klient odpowiada za zmniejszenie wartości towaru wynikające z korzystania z niego w sposób wykraczający poza sprawdzenie jego cech i funkcjonowania.",
          ]}
        />
      </Section>

      <Section title="8. Reklamacje">
        <Bullets
          items={[
            "Sprzedawca odpowiada za zgodność towaru z umową na zasadach rękojmi przez 2 lata od wydania rzeczy.",
            "Niezależnie od rękojmi Sprzedawca udziela 24 miesięcy gwarancji na szwy i okucia.",
            "Reklamację składa się e-mailem: numer zamówienia, opis wady i zdjęcia. Sprzedawca rozpatruje ją w terminie 14 dni.",
            "Brak odpowiedzi w terminie 14 dni oznacza uznanie reklamacji za uzasadnioną.",
            "Koszt dostarczenia towaru reklamowanego i odesłania go po naprawie pokrywa Sprzedawca, jeśli reklamacja jest uzasadniona.",
          ]}
        />
        <P>
          Procedurę krok po kroku opisaliśmy w{" "}
          <InfoLink href="/zwroty-i-reklamacje">zwrotach i reklamacjach</InfoLink>, a zakres
          gwarancji w{" "}
          <InfoLink href="/gwarancja-i-serwis">gwarancji i serwisie</InfoLink>.
        </P>
      </Section>

      <Section title="9. Dane osobowe">
        <P>
          Administratorem danych osobowych jest {COMPANY.legalName}. Dane przetwarzamy
          w zakresie niezbędnym do realizacji zamówienia i wykonania obowiązków prawnych.
          Zakres, cele, podstawy prawne i prawa osoby, której dane dotyczą, opisuje{" "}
          <InfoLink href="/polityka-prywatnosci">polityka prywatności</InfoLink>.
        </P>
      </Section>

      <Section title="10. Postanowienia końcowe">
        <Bullets
          items={[
            "W sprawach nieuregulowanych stosuje się prawo polskie, w szczególności Kodeks cywilny i ustawę o prawach konsumenta.",
            "Konsument może skorzystać z pozasądowych sposobów rozpatrywania sporów: powiatowy rzecznik konsumentów, wojewódzki inspektorat Inspekcji Handlowej, platforma ODR Komisji Europejskiej. Udział w nich jest dobrowolny dla obu stron.",
            "Sprzedawca może zmienić regulamin z ważnych przyczyn, w tym zmiany przepisów lub zakresu usług. Zamówienia złożone przed zmianą realizujemy według regulaminu obowiązującego w chwili ich złożenia.",
            "Do korzystania ze Sklepu wystarczy urządzenie z dostępem do internetu, aktualna przeglądarka i czynne konto e-mail.",
          ]}
        />
      </Section>
    </>
  );
}
