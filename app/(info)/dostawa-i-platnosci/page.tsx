import type { Metadata } from "next";
import { COMPANY, FREE_SHIPPING_THRESHOLD, SHIPPING_OPTIONS } from "@/lib/nav";
import { formatPrice } from "@/lib/utils";
import { Bullets, InfoHeader, InfoLink, Mail, Note, P, Section } from "../_ui";

export const metadata: Metadata = {
  title: "Dostawa i płatności",
  description:
    "Wysyłka w 24 h w dni robocze, paczkomat od 12,99 zł, kurier od 15,99 zł, darmowa dostawa od 299 zł. Zamówienia przyjmujemy mailem, płacisz przelewem albo za pobraniem.",
  alternates: { canonical: "/dostawa-i-platnosci" },
};

// type-label, nie monospace: kroj maszynowy nalezy do sekcji PAKT-K9, a to jest strona sklepu
const TH = "type-label px-4 py-3 text-left text-nf-dim";
const TD = "px-4 py-3 text-sm text-nf-text";

// cennik ma jedno zrodlo (SHIPPING_OPTIONS) - tekst pod tabela nie moze sie z nia rozjechac
const EU = SHIPPING_OPTIONS.find((option) => option.carrier.includes("Unia Europejska"));
const COD = SHIPPING_OPTIONS.find((option) => option.carrier.includes("pobraniem"));

export default function ShippingPage() {
  return (
    <>
      <InfoHeader
        title="Dostawa i płatności"
        lead="Zamówienia opłacone do 14:00 w dni robocze pakujemy i nadajemy tego samego dnia. Złożone później wychodzą następnego dnia roboczego."
      />

      <Section title="Kiedy wysyłamy">
        <Bullets
          items={[
            "Zamówienie opłacone do 14:00 w dzień roboczy: nadanie tego samego dnia.",
            "Zamówienie opłacone po 14:00, w sobotę, niedzielę lub święto: nadanie w najbliższy dzień roboczy.",
            "Przelew tradycyjny: nadajemy po zaksięgowaniu wpłaty, zwykle następnego dnia roboczego.",
            "Numer listu przewozowego wysyłamy mailem w chwili nadania paczki.",
          ]}
        />
      </Section>

      <Section title="Przewoźnicy i koszty">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse border border-nf-border">
            <caption className="sr-only">
              Koszty i czasy dostawy według przewoźnika
            </caption>
            <thead className="bg-nf-elevated">
              <tr className="border-b border-nf-border">
                <th scope="col" className={TH}>
                  Przewoźnik
                </th>
                <th scope="col" className={TH}>
                  Koszt
                </th>
                <th scope="col" className={TH}>
                  Czas
                </th>
                <th scope="col" className={TH}>
                  Od {FREE_SHIPPING_THRESHOLD} zł
                </th>
              </tr>
            </thead>
            <tbody>
              {SHIPPING_OPTIONS.map((option) => (
                <tr key={option.carrier} className="border-b border-nf-border last:border-b-0">
                  <th scope="row" className={`${TD} font-medium`}>
                    {option.carrier}
                  </th>
                  <td className={TD}>{formatPrice(option.price)}</td>
                  <td className={TD}>{option.time}</td>
                  <td className={TD}>
                    {option.freeAboveThreshold ? (
                      <span className="text-nf-white">gratis</span>
                    ) : (
                      <span className="text-nf-dim">bez zmian</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Czas dostawy liczymy od nadania paczki, nie od złożenia zamówienia. Podane terminy
          to deklaracja przewoźnika.
        </P>
      </Section>

      <Section title="Darmowa dostawa">
        <P>
          Od {FREE_SHIPPING_THRESHOLD} zł wartości koszyka paczkomat i kurier przedpłacony
          są bezpłatne. Liczy się wartość produktów po rabatach, bez kosztu dostawy. Przy
          płatności za pobraniem koszt dostawy naliczamy zawsze - pobranie obsługuje
          przewoźnik i my za nie płacimy.
        </P>
        <P>
          Postęp do progu widzisz w koszyku i w podglądzie koszyka: pokazujemy, ile brakuje
          do darmowej dostawy.
        </P>
      </Section>

      <Section title="Płatności">
        <P>
          Zamówienie składasz mailem: <Mail address={COMPANY.shopEmail} />. Przycisk w koszyku
          otwiera wiadomość z listą pozycji i sumą - dopisujesz adres i wysyłasz. W odpowiedzi
          dostajesz potwierdzenie, kwotę do zapłaty i numer rachunku.
        </P>
        <Bullets
          items={[
            "Przelew tradycyjny - numer rachunku i tytuł podajemy w e-mailu z potwierdzeniem zamówienia. Czekamy na wpłatę 7 dni, potem zamówienie anulujemy.",
            `Za pobraniem - płacisz kurierowi przy odbiorze, koszt ${
              COD ? formatPrice(COD.price) : ""
            }.`,
          ]}
        />
        <Note>
          Kasy online w sklepie nie ma: kartą, BLIK-iem ani przez Przelewy24 nie zapłacisz.
          Rozliczamy się przelewem albo przy odbiorze paczki.
        </Note>
      </Section>

      <Section title="Dostawa zagraniczna">
        <P>
          Wysyłamy do wszystkich krajów Unii Europejskiej: kurier{" "}
          {EU ? formatPrice(EU.price) : ""}, {EU ? EU.time : ""}. Ceny w sklepie zawierają
          polski VAT, do zamówień z UE nie doliczamy cła ani opłat dodatkowych. Poza Unię
          Europejską nie wysyłamy.
        </P>
        <P>
          Zamówienia hurtowe i wysyłki na fakturę dla jednostek prowadzimy osobno:{" "}
          <Mail address={COMPANY.k9Email} />.
        </P>
      </Section>

      <Section title="Odbiór paczki">
        <Bullets
          items={[
            "Sprawdź paczkę przy kurierze. Widoczne uszkodzenie opakowania: spisz protokół i wyślij nam zdjęcia.",
            "Paczkomat przechowuje przesyłkę 48 godzin, potem wraca do nadawcy.",
            "Paczka nieodebrana i zwrócona do nas: wysyłamy ponownie po dopłacie za drugą wysyłkę albo zwracamy pieniądze za produkty.",
          ]}
        />
        <P>
          Zwroty i wymiany rozmiaru opisaliśmy osobno:{" "}
          <InfoLink href="/zwroty-i-reklamacje">zwroty i reklamacje</InfoLink>.
        </P>
      </Section>
    </>
  );
}
