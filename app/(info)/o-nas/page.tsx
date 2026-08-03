import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COMPANY } from "@/lib/nav";
import { Bullets, Facts, InfoHeader, InfoLink, Mail, P, Section } from "../_ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("infoPages");
  return {
    title: t("onas.meta.title"),
    description: t("onas.meta.description"),
    alternates: { canonical: "/o-nas" },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("infoPages");

  return (
    <>
      <InfoHeader title={t("onas.header.title")} lead={t("onas.header.lead")} />

      <Section title={t("onas.kim.title")}>
        <P>{t("onas.kim.p1")}</P>
        <P>{t("onas.kim.p2")}</P>
        <Facts
          rows={[
            { label: t("onas.kim.facts.foundedLabel"), value: "2019" },
            {
              label: t("onas.kim.facts.hqLabel"),
              value: `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`,
            },
            { label: t("onas.kim.facts.teamLabel"), value: t("onas.kim.facts.teamValue") },
            { label: t("onas.kim.facts.contactLabel"), value: <Mail address={COMPANY.shopEmail} /> },
          ]}
        />
      </Section>

      <Section title={t("onas.proline.title")}>
        <P>{t("onas.proline.p1")}</P>
        <P>
          {t.rich("onas.proline.p2", {
            link: (chunks) => <InfoLink href="/pro">{chunks}</InfoLink>,
          })}
        </P>
      </Section>

      <Section title={t("onas.test.title")}>
        <Bullets
          items={[
            t("onas.test.i1"),
            t("onas.test.i2"),
            t("onas.test.i3"),
            t("onas.test.i4"),
          ]}
        />
        <P>{t("onas.test.p")}</P>
      </Section>

      <Section title={t("onas.material.title")}>
        <Bullets
          items={[
            t("onas.material.i1"),
            t("onas.material.i2"),
            t("onas.material.i3"),
            t("onas.material.i4"),
            t("onas.material.i5"),
          ]}
        />
      </Section>

      <Section title={t("onas.notdo.title")}>
        <Bullets
          items={[t("onas.notdo.i1"), t("onas.notdo.i2"), t("onas.notdo.i3")]}
        />
        <P>
          {t.rich("onas.notdo.p", {
            link: (chunks) => <InfoLink href="/kontakt">{chunks}</InfoLink>,
          })}{" "}
          <Mail address={COMPANY.proEmail} />.
        </P>
      </Section>
    </>
  );
}
