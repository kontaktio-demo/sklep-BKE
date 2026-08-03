import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COMPANY, FREE_SHIPPING_THRESHOLD } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, P, Section } from "../_ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("infoLegal.regulamin.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/regulamin" },
  };
}

const ADDRESS = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

export default async function TermsPage() {
  const t = await getTranslations("infoLegal.regulamin");

  return (
    <>
      <InfoHeader
        title={t("header.title")}
        lead={t("header.lead")}
        updated={t("header.updated")}
      />

      <Section title={t("seller.title")}>
        <Facts
          rows={[
            { label: t("seller.labelSeller"), value: COMPANY.legalName },
            { label: t("seller.labelOffice"), value: `${ADDRESS}, ${COMPANY.country}` },
            { label: t("seller.labelNip"), value: COMPANY.nip },
            { label: t("seller.labelRegon"), value: COMPANY.regon },
            { label: t("seller.labelKrs"), value: `${COMPANY.krs}, ${COMPANY.court}` },
            {
              label: t("seller.labelShareCapital"),
              value: t("seller.shareCapital", { value: COMPANY.shareCapital }),
            },
            { label: t("seller.labelContact"), value: <Mail address={COMPANY.shopEmail} /> },
            { label: t("seller.labelPhone"), value: COMPANY.phone },
          ]}
        />
      </Section>

      <Section title={t("definitions.title")}>
        <Bullets
          items={[
            t("definitions.shop"),
            t("definitions.client"),
            t("definitions.consumer"),
            t("definitions.consumerEntrepreneur"),
            t("definitions.order"),
          ]}
        />
      </Section>

      <Section title={t("orders.title")}>
        <P>{t("orders.intro")}</P>
        <Bullets
          items={[
            t("orders.b1"),
            t("orders.b2"),
            t("orders.b3"),
            t("orders.b4"),
          ]}
        />
      </Section>

      <Section title={t("prices.title")}>
        <Bullets
          items={[
            t("prices.b1"),
            t("prices.b2"),
            t.rich("prices.freeShipping", {
              amount: FREE_SHIPPING_THRESHOLD,
              link: (chunks) => <InfoLink href="/dostawa-i-platnosci">{chunks}</InfoLink>,
            }),
            t("prices.b4"),
            t("prices.b5"),
          ]}
        />
      </Section>

      <Section title={t("payments.title")}>
        <Bullets
          items={[
            t("payments.b1"),
            t("payments.b2"),
            t("payments.b3"),
            t("payments.b4"),
          ]}
        />
      </Section>

      <Section title={t("delivery.title")}>
        <Bullets
          items={[
            t("delivery.b1"),
            t("delivery.b2"),
            t("delivery.b3"),
            t("delivery.b4"),
          ]}
        />
      </Section>

      <Section title={t("withdrawal.title")}>
        <P>{t("withdrawal.intro")}</P>
        <Bullets
          items={[
            t("withdrawal.b1"),
            t("withdrawal.b2"),
            t("withdrawal.b3"),
            t("withdrawal.b4"),
            t("withdrawal.b5"),
          ]}
        />
      </Section>

      <Section title={t("complaints.title")}>
        <Bullets
          items={[
            t("complaints.b1"),
            t("complaints.b2"),
            t("complaints.b3"),
            t("complaints.b4"),
            t("complaints.b5"),
          ]}
        />
        <P>
          {t.rich("complaints.outro", {
            link1: (chunks) => <InfoLink href="/zwroty-i-reklamacje">{chunks}</InfoLink>,
            link2: (chunks) => <InfoLink href="/gwarancja-i-serwis">{chunks}</InfoLink>,
          })}
        </P>
      </Section>

      <Section title={t("data.title")}>
        <P>
          {t.rich("data.body", {
            company: COMPANY.legalName,
            link: (chunks) => <InfoLink href="/polityka-prywatnosci">{chunks}</InfoLink>,
          })}
        </P>
      </Section>

      <Section title={t("final.title")}>
        <Bullets
          items={[
            t("final.b1"),
            t("final.b2"),
            t("final.b3"),
            t("final.b4"),
          ]}
        />
      </Section>
    </>
  );
}
