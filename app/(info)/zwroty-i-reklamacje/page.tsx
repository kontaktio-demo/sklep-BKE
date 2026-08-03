import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, Note, P, Section, Steps } from "../_ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("infoLegal.zwroty.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/zwroty-i-reklamacje" },
  };
}

const ADDRESS = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

export default async function ReturnsPage() {
  const t = await getTranslations("infoLegal.zwroty");
  const tc = await getTranslations("common");

  return (
    <>
      <InfoHeader title={t("header.title")} lead={t("header.lead")} />

      <Section title={t("return60.title")}>
        <P>{t("return60.intro")}</P>
        <Bullets
          items={[
            t("return60.b1"),
            t("return60.b2"),
            t("return60.b3"),
            t("return60.b4"),
          ]}
        />
      </Section>

      <Section title={t("howto.title")}>
        <Steps
          items={[
            t.rich("howto.s1", {
              email: COMPANY.shopEmail,
              mail: () => <Mail address={COMPANY.shopEmail} />,
            }),
            t("howto.s2"),
            t("howto.s3"),
            t("howto.s4"),
            t("howto.s5"),
          ]}
        />
        <Facts
          rows={[
            {
              label: t("howto.labelAddress"),
              value: (
                <>
                  {tc("company.returnsRecipient")}
                  <br />
                  {ADDRESS}
                </>
              ),
            },
            { label: t("howto.labelCost"), value: t("howto.costValue") },
            { label: t("howto.labelRefund"), value: t("howto.refundValue") },
          ]}
        />
      </Section>

      <Section title={t("exchange.title")}>
        <P>{t("exchange.p1")}</P>
        <P>
          {t.rich("exchange.p2", {
            link: (chunks) => <InfoLink href="/tabela-rozmiarow">{chunks}</InfoLink>,
          })}
        </P>
      </Section>

      <Section title={t("complaint.title")}>
        <P>{t("complaint.intro")}</P>
        <Steps
          items={[
            t.rich("complaint.s1", {
              email: COMPANY.shopEmail,
              mail: () => <Mail address={COMPANY.shopEmail} />,
            }),
            t("complaint.s2"),
            t("complaint.s3"),
            t("complaint.s4"),
          ]}
        />
        <Note>
          {t.rich("complaint.note", {
            link: (chunks) => <InfoLink href="/gwarancja-i-serwis">{chunks}</InfoLink>,
          })}
        </Note>
      </Section>

      <Section title={t("disputes.title")}>
        <P>{t("disputes.body")}</P>
      </Section>
    </>
  );
}
