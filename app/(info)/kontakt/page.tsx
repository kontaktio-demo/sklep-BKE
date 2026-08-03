import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, Note, P, Section } from "../_ui";
import { ContactForm } from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("infoPages");
  return {
    title: t("kontakt.meta.title"),
    description: t("kontakt.meta.description"),
    alternates: { canonical: "/kontakt" },
  };
}

const ADDRESS = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

export default async function ContactPage() {
  const t = await getTranslations("infoPages");

  return (
    <>
      <InfoHeader title={t("kontakt.header.title")} lead={t("kontakt.header.lead")} />

      <Section title={t("kontakt.shop.title")}>
        <P>{t("kontakt.shop.p")}</P>
        <Facts
          rows={[
            { label: t("kontakt.shop.emailLabel"), value: <Mail address={COMPANY.shopEmail} /> },
            {
              label: t("kontakt.shop.phoneLabel"),
              value: (
                <a
                  href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                  className="underline underline-offset-4"
                >
                  {COMPANY.phone}
                </a>
              ),
            },
            { label: t("kontakt.shop.hoursLabel"), value: COMPANY.officeHours },
            { label: t("kontakt.shop.responseLabel"), value: COMPANY.responseTime },
          ]}
        />
      </Section>

      <Section title={t("kontakt.pro.title")}>
        <P>{t("kontakt.pro.p")}</P>
        <Facts rows={[{ label: t("kontakt.pro.emailLabel"), value: <Mail address={COMPANY.proEmail} /> }]} />
      </Section>

      <Section title={t("kontakt.returns.title")}>
        <P>
          {t.rich("kontakt.returns.p", {
            email: COMPANY.shopEmail,
            link: (chunks) => (
              <InfoLink href="/zwroty-i-reklamacje">{chunks}</InfoLink>
            ),
          })}
        </P>
        <Facts
          rows={[
            {
              label: t("kontakt.returns.addressLabel"),
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
        <Note>{t("kontakt.returns.note")}</Note>
      </Section>

      <Section title={t("kontakt.company.title")}>
        <Facts
          rows={[
            { label: t("kontakt.company.nameLabel"), value: COMPANY.legalName },
            { label: t("kontakt.company.addressLabel"), value: `${ADDRESS}, ${COMPANY.country}` },
            { label: t("kontakt.company.nipLabel"), value: COMPANY.nip },
            { label: t("kontakt.company.regonLabel"), value: COMPANY.regon },
            { label: t("kontakt.company.krsLabel"), value: COMPANY.krs },
            { label: t("kontakt.company.courtLabel"), value: COMPANY.court },
            {
              label: t("kontakt.company.capitalLabel"),
              value: `${COMPANY.shareCapital}, ${t("kontakt.company.paidUp")}`,
            },
            { label: t("kontakt.company.privacyLabel"), value: <Mail address={COMPANY.privacyEmail} /> },
          ]}
        />
      </Section>

      <Section title={t("kontakt.before.title")}>
        <P>{t("kontakt.before.p")}</P>
        <Bullets
          items={[
            t.rich("kontakt.before.i1", {
              link: (chunks) => <InfoLink href="/tabela-rozmiarow">{chunks}</InfoLink>,
            }),
            t.rich("kontakt.before.i2", {
              link: (chunks) => <InfoLink href="/dostawa-i-platnosci">{chunks}</InfoLink>,
            }),
            t.rich("kontakt.before.i3", {
              link: (chunks) => <InfoLink href="/gwarancja-i-serwis">{chunks}</InfoLink>,
            }),
          ]}
        />
      </Section>

      <Section title={t("kontakt.form.title")}>
        <ContactForm />
      </Section>
    </>
  );
}
