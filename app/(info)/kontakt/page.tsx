import type { Metadata } from "next";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, Note, P, Section } from "../_ui";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt do sklepu Dog Store: e-mail, telefon, godziny pracy, dane firmy i adres do zwrotów. Odpisujemy do 24 godzin w dni robocze.",
  alternates: { canonical: "/kontakt" },
};

const ADDRESS = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

export default function ContactPage() {
  return (
    <>
      <InfoHeader
        title="Kontakt"
        lead="Piszemy i odbieramy telefon w dni robocze. Na wiadomości odpowiadamy do 24 godzin roboczych, zwykle szybciej."
      />

      <Section title="Sklep i zamówienia">
        <P>
          Sprawy dotyczące zamówień, wysyłki, doboru rozmiaru i dostępności modeli.
        </P>
        <Facts
          rows={[
            { label: "E-mail", value: <Mail address={COMPANY.shopEmail} /> },
            {
              label: "Telefon",
              value: (
                <a
                  href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                  className="underline underline-offset-4"
                >
                  {COMPANY.phone}
                </a>
              ),
            },
            { label: "Godziny pracy", value: COMPANY.officeHours },
            { label: "Czas odpowiedzi", value: COMPANY.responseTime },
          ]}
        />
      </Section>

      <Section title="Dog Store Pro">
        <P>
          Jednostki, szkoły przewodników, kluby sportowe i firmy ochrony. Zapytania ofertowe,
          faktury z odroczonym terminem płatności, dobór sprzętu do zadania i oznaczenia na
          zamówienie.
        </P>
        <Facts rows={[{ label: "E-mail", value: <Mail address={COMPANY.proEmail} /> }]} />
      </Section>

      <Section title="Zwroty i reklamacje">
        <P>
          Zwrot lub reklamację zgłoś mailem na {COMPANY.shopEmail}, zanim wyślesz paczkę.
          Procedura i lista rzeczy, które musimy dostać, są opisane na stronie{" "}
          <InfoLink href="/zwroty-i-reklamacje">Zwroty i reklamacje</InfoLink>.
        </P>
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
          ]}
        />
        <Note>
          Nie przyjmujemy przesyłek za pobraniem. Koszt odesłania towaru pokrywa kupujący,
          poza wymianą rozmiaru - pierwszą wymianę wysyłamy na nasz koszt.
        </Note>
      </Section>

      <Section title="Dane firmy">
        <Facts
          rows={[
            { label: "Nazwa", value: COMPANY.legalName },
            { label: "Adres", value: `${ADDRESS}, ${COMPANY.country}` },
            { label: "NIP", value: COMPANY.nip },
            { label: "REGON", value: COMPANY.regon },
            { label: "KRS", value: COMPANY.krs },
            { label: "Rejestr", value: COMPANY.court },
            { label: "Kapitał zakładowy", value: `${COMPANY.shareCapital}, wpłacony w całości` },
            { label: "Dane osobowe", value: <Mail address={COMPANY.privacyEmail} /> },
          ]}
        />
      </Section>

      <Section title="Zanim napiszesz">
        <P>Najczęstsze sprawy mają własne strony i tam odpowiedź jest od ręki.</P>
        <Bullets
          items={[
            <>
              Nie wiesz, jaki rozmiar wybrać:{" "}
              <InfoLink href="/tabela-rozmiarow">tabela rozmiarów</InfoLink>
            </>,
            <>
              Pytanie o koszt i czas dostawy:{" "}
              <InfoLink href="/dostawa-i-platnosci">dostawa i płatności</InfoLink>
            </>,
            <>
              Pękła klamra albo rozeszedł się szew:{" "}
              <InfoLink href="/gwarancja-i-serwis">gwarancja i serwis</InfoLink>
            </>,
          ]}
        />
      </Section>

      <Section title="Formularz kontaktowy">
        <ContactForm />
      </Section>
    </>
  );
}
