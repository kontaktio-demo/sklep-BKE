import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, Note, P, Section, Steps } from "../_ui";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("infoLegal.gwarancja.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/gwarancja-i-serwis" },
  };
}

const REPAIRS: { id: string; price: number }[] = [
  { id: "buckle", price: 25 },
  { id: "snap", price: 20 },
  { id: "seam", price: 30 },
  { id: "idPanel", price: 15 },
  { id: "shorten", price: 30 },
];

// type-label, nie monospace: kroj maszynowy nalezy do sekcji Dog Store Pro, a to jest strona sklepu
const TH = "type-label px-4 py-3 text-left text-nf-dim";
const TD = "px-4 py-3 text-sm text-nf-text";

export default async function WarrantyPage() {
  const t = await getTranslations("infoLegal.gwarancja");

  return (
    <>
      <InfoHeader title={t("header.title")} lead={t("header.lead")} />

      <Section title={t("scope.title")}>
        <P>{t("scope.intro")}</P>
        <Bullets
          items={[
            t("scope.b1"),
            t("scope.b2"),
            t("scope.b3"),
            t("scope.b4"),
            t("scope.b5"),
          ]}
        />
      </Section>

      <Section title={t("exclusions.title")}>
        <Bullets
          items={[
            t("exclusions.b1"),
            t("exclusions.b2"),
            t("exclusions.b3"),
            t("exclusions.b4"),
            t("exclusions.b5"),
            t("exclusions.b6"),
            t("exclusions.b7"),
          ]}
        />
        <Note>
          {t.rich("exclusions.note", {
            link: (chunks) => <InfoLink href="/zwroty-i-reklamacje">{chunks}</InfoLink>,
          })}
        </Note>
      </Section>

      <Section id="serwis" title={t("serwis.title")}>
        <P>{t("serwis.intro")}</P>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse border border-nf-border">
            <caption className="sr-only">{t("serwis.caption")}</caption>
            <thead className="bg-nf-elevated">
              <tr className="border-b border-nf-border">
                <th scope="col" className={TH}>
                  {t("serwis.thJob")}
                </th>
                <th scope="col" className={TH}>
                  {t("serwis.thCost")}
                </th>
                <th scope="col" className={TH}>
                  {t("serwis.thScope")}
                </th>
              </tr>
            </thead>
            <tbody>
              {REPAIRS.map((repair) => (
                <tr key={repair.id} className="border-b border-nf-border last:border-b-0">
                  <th scope="row" className={`${TD} font-medium`}>
                    {t(`serwis.repairs.${repair.id}.job`)}
                  </th>
                  <td className={TD}>{formatPrice(repair.price)}</td>
                  <td className={`${TD} text-nf-muted`}>{t(`serwis.repairs.${repair.id}.note`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Steps
          items={[
            t.rich("serwis.s1", {
              email: COMPANY.shopEmail,
              mail: () => <Mail address={COMPANY.shopEmail} />,
            }),
            t("serwis.s2"),
            t("serwis.s3"),
            t("serwis.s4"),
          ]}
        />
        <Facts
          rows={[
            {
              label: t("serwis.labelAddress"),
              value: (
                <>
                  {COMPANY.returnsRecipient}
                  <br />
                  {`${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`}
                </>
              ),
            },
            { label: t("serwis.labelTime"), value: t("serwis.timeValue") },
            { label: t("serwis.labelContact"), value: <Mail address={COMPANY.shopEmail} /> },
          ]}
        />
      </Section>

      <Section id="pielegnacja" title={t("care.title")}>
        <P>{t("care.intro")}</P>
        <Bullets
          items={[
            t("care.b1"),
            t("care.b2"),
            t("care.b3"),
            t("care.b4"),
            t("care.b5"),
            t("care.b6"),
            t("care.b7"),
          ]}
        />
      </Section>
    </>
  );
}
