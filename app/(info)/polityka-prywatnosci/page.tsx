import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, Note, P, Section } from "../_ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("infoLegal.polityka.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/polityka-prywatnosci" },
  };
}

const ADDRESS = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

export default async function PrivacyPage() {
  const t = await getTranslations("infoLegal.polityka");

  return (
    <>
      <InfoHeader
        title={t("header.title")}
        lead={t("header.lead")}
        updated={t("header.updated")}
      />

      <Section title={t("admin.title")}>
        <Facts
          rows={[
            { label: t("admin.labelAdmin"), value: COMPANY.legalName },
            { label: t("admin.labelAddress"), value: `${ADDRESS}, ${COMPANY.country}` },
            { label: t("admin.labelNip"), value: COMPANY.nip },
            { label: t("admin.labelContact"), value: <Mail address={COMPANY.privacyEmail} /> },
          ]}
        />
        <P>{t("admin.note", { email: COMPANY.privacyEmail })}</P>
      </Section>

      <Section title={t("collect.title")}>
        <Bullets
          items={[
            t("collect.b1"),
            t("collect.b2"),
            t("collect.b3"),
            t("collect.b4"),
            t("collect.b5"),
          ]}
        />
      </Section>

      <Section title={t("purposes.title")}>
        <Facts
          rows={[
            { label: t("purposes.orderLabel"), value: t("purposes.orderValue") },
            { label: t("purposes.invoiceLabel"), value: t("purposes.invoiceValue") },
            { label: t("purposes.returnsLabel"), value: t("purposes.returnsValue") },
            { label: t("purposes.newsletterLabel"), value: t("purposes.newsletterValue") },
            { label: t("purposes.replyLabel"), value: t("purposes.replyValue") },
            { label: t("purposes.claimsLabel"), value: t("purposes.claimsValue") },
          ]}
        />
      </Section>

      <Section title={t("recipients.title")}>
        <Bullets
          items={[
            t("recipients.b1"),
            t("recipients.b2"),
            t("recipients.b3"),
            t("recipients.b4"),
            t("recipients.b5"),
          ]}
        />
        <P>{t("recipients.outro")}</P>
      </Section>

      <Section title={t("retention.title")}>
        <Bullets
          items={[
            t("retention.b1"),
            t("retention.b2"),
            t("retention.b3"),
            t("retention.b4"),
            t("retention.b5"),
          ]}
        />
      </Section>

      <Section title={t("rights.title")}>
        <Bullets
          items={[
            t("rights.b1"),
            t("rights.b2"),
            t("rights.b3"),
            t("rights.b4"),
            t("rights.b5"),
            t("rights.b6"),
            t("rights.b7"),
          ]}
        />
        <P>
          {t.rich("rights.outro", {
            email: COMPANY.privacyEmail,
            mail: () => <Mail address={COMPANY.privacyEmail} />,
          })}
        </P>
      </Section>

      <Section title={t("cookies.title")}>
        <Bullets
          items={[
            t("cookies.b1"),
            t("cookies.b2"),
            t("cookies.b3"),
          ]}
        />
        <Note>{t("cookies.note")}</Note>
        <P>{t("cookies.outro")}</P>
      </Section>

      <Section title={t("profiling.title")}>
        <P>{t("profiling.body")}</P>
      </Section>

      <Section title={t("changes.title")}>
        <P>
          {t.rich("changes.body", {
            link: (chunks) => <InfoLink href="/regulamin">{chunks}</InfoLink>,
          })}
        </P>
      </Section>
    </>
  );
}
