import type { Metadata } from "next";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, Note, P, Section, Steps } from "../_ui";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gwarancja i serwis",
  description:
    "2 lata gwarancji na szwy i okucia. Co obejmuje, czego nie obejmuje, cennik serwisu: wymiana klamry, karabińczyka, przeszycie. Naprawa do 10 dni roboczych.",
  alternates: { canonical: "/gwarancja-i-serwis" },
};

const REPAIRS: { job: string; price: number; note: string }[] = [
  { job: "Wymiana klamry", price: 25, note: "Klamra z tej samej serii, montaż i przeszycie" },
  { job: "Wymiana karabińczyka lub pierścienia", price: 20, note: "Okucie stalowe lub aluminiowe" },
  { job: "Przeszycie rozejścia", price: 30, note: "Nić poliestrowa 40, szew krzyżowy" },
  { job: "Wymiana panelu ID", price: 15, note: "Panel rzepowy, bez ingerencji w taśmę" },
  { job: "Skrócenie taśmy", price: 30, note: "Cięcie, zgrzanie krawędzi, nowe przeszycie" },
];

const TH =
  "px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.15em] text-nf-dim";
const TD = "px-4 py-3 text-sm text-nf-text";

export default function WarrantyPage() {
  return (
    <>
      <InfoHeader
        title="Gwarancja i serwis"
        lead="Dwa lata gwarancji na szwy i okucia. Po gwarancji naprawiamy dalej, tylko odpłatnie - obroża, której pękła klamra, nie jest do wyrzucenia."
      />

      <Section title="Zakres gwarancji">
        <P>
          Gwarancja obejmuje 24 miesiące od daty zakupu i dotyczy wykonania: szwów, okuć,
          zgrzewów i połączeń. Podstawą jest dowód zakupu, wystarczy numer zamówienia.
        </P>
        <Bullets
          items={[
            "Pęknięta lub wyłamana klamra przy normalnym użytkowaniu.",
            "Rozejście szwu, wysunięcie nici, rozwarstwienie taśmy.",
            "Urwany pierścień D, karabińczyk, nit lub złącze.",
            "Korozja okucia stalowego w ciągu 24 miesięcy przy pielęgnacji zgodnej z zaleceniami.",
            "E-obroże: 24 miesiące na elektronikę i wodoszczelność, 6 miesięcy na akumulator.",
          ]}
        />
      </Section>

      <Section title="Czego gwarancja nie obejmuje">
        <Bullets
          items={[
            "Zużycia eksploatacyjnego: przetarcia taśmy, zarysowania okuć, wyblakłego koloru po sezonie w słońcu.",
            "Przegryzienia i uszkodzeń zrobionych przez psa, własnego lub cudzego.",
            "Cięcia, przewiercania, wszywania własnych elementów i innych przeróbek.",
            "Kontaktu z rozpuszczalnikami, wybielaczem, kwasem, olejem napędowym.",
            "Korozji po kąpieli w wodzie morskiej bez wypłukania słodką wodą.",
            "Akumulatora, który po roku pracy trzyma krócej. Utrata pojemności ogniwa to normalne zjawisko, nie wada.",
            "Uszkodzeń elektroniki po samodzielnym otwarciu obudowy.",
          ]}
        />
        <Note>
          Gwarancja nie wyłącza rękojmi. Jeśli produkt ma wadę, możesz zamiast gwarancji
          skorzystać z rękojmi u sprzedawcy - opisaliśmy to w{" "}
          <InfoLink href="/zwroty-i-reklamacje">zwrotach i reklamacjach</InfoLink>.
        </Note>
      </Section>

      <Section id="serwis" title="Serwis i naprawy">
        <P>
          Naprawiamy sprzęt PAKT także po gwarancji i niezależnie od tego, czy uszkodzenie
          jest wadą, czy skutkiem pracy psa. Wymiana klamry jest tańsza niż nowa obroża.
        </P>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse border border-nf-border">
            <caption className="sr-only">Cennik napraw pogwarancyjnych</caption>
            <thead className="bg-nf-elevated">
              <tr className="border-b border-nf-border">
                <th scope="col" className={TH}>
                  Naprawa
                </th>
                <th scope="col" className={TH}>
                  Koszt
                </th>
                <th scope="col" className={TH}>
                  Zakres
                </th>
              </tr>
            </thead>
            <tbody>
              {REPAIRS.map((repair) => (
                <tr key={repair.job} className="border-b border-nf-border last:border-b-0">
                  <th scope="row" className={`${TD} font-medium`}>
                    {repair.job}
                  </th>
                  <td className={TD}>{formatPrice(repair.price)}</td>
                  <td className={`${TD} text-nf-muted`}>{repair.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Steps
          items={[
            <>
              Wyślij zdjęcia uszkodzenia na <Mail address={COMPANY.shopEmail} /> z numerem
              zamówienia. Odpowiadamy z wyceną i decyzją, czy sprawa idzie z gwarancji, czy
              z cennika.
            </>,
            "Wyślij sprzęt na adres serwisu. Wysyłkę do nas opłaca właściciel, odsyłkę po naprawie pokrywamy my.",
            "Naprawa trwa do 10 dni roboczych od dostarczenia paczki. Jeśli brakuje części, informujemy o terminie przed rozpoczęciem pracy.",
            "Naprawa gwarancyjna jest bezpłatna razem z wysyłką w obie strony.",
          ]}
        />
        <Facts
          rows={[
            {
              label: "Adres serwisu",
              value: (
                <>
                  {COMPANY.returnsRecipient}
                  <br />
                  {`${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`}
                </>
              ),
            },
            { label: "Czas naprawy", value: "Do 10 dni roboczych od dostarczenia" },
            { label: "Zgłoszenie", value: <Mail address={COMPANY.shopEmail} /> },
          ]}
        />
      </Section>

      <Section id="pielegnacja" title="Pielęgnacja">
        <P>
          Obroża z nylonu 1000D wytrzyma lata, jeśli nie zostawisz jej brudnej i mokrej.
          Kilka zasad, które przedłużają życie sprzętu i chronią gwarancję.
        </P>
        <Bullets
          items={[
            "Myj ręcznie: letnia woda, szare mydło, szczotka o średniej twardości. Wypłucz i wysusz w cieniu.",
            "Nie pierz w pralce. Okucia obijają bęben, a wysoka temperatura rozmiękcza klej pod wyściółką.",
            "Nie susz na kaloryferze i nie susz suszarką. Nylon się kurczy, taśma traci wymiar.",
            "Po pracy w wodzie słonej wypłucz obrożę słodką wodą. Sól zjada stal i zostawia ślad w szwach.",
            "Łańcuszek przetrzyj do sucha i raz na sezon przetrzyj szmatką z odrobiną oleju maszynowego.",
            "Nie używaj wybielaczy, acetonu ani rozpuszczalników. Nylon zbieleje i straci wytrzymałość.",
            "Raz w miesiącu sprawdź okucia: luz na nicie, rysa na klamrze i skrzywiony pierścień to sygnały do wymiany, zanim puszczą w terenie.",
          ]}
        />
      </Section>
    </>
  );
}
