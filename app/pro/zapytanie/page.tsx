import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { getProCategories, getProProducts } from "@/lib/data";
import { ProInquiryForm } from "@/components/pro/ProInquiryForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pro");
  return {
    title: { absolute: `${t("inquiry.meta.title")} | Dog Store Pro` },
    description: t("inquiry.meta.description"),
  };
}

const CONTAINER = "mx-auto max-w-[1600px] px-4 md:px-6";

const TERM_KEYS = [
  { code: "01", key: "pricing" },
  { code: "02", key: "marking" },
  { code: "03", key: "leadTime" },
  { code: "04", key: "settlement" },
] as const;

export default async function ProInquiryPage() {
  const t = await getTranslations("pro");
  const [categories, products] = await Promise.all([getProCategories(), getProProducts()]);

  const terms = TERM_KEYS.map(({ code, key }) => ({
    code,
    title: t(`inquiry.terms.${key}.title`),
    body: t(`inquiry.terms.${key}.body`),
  }));

  return (
    <div className="bg-nf-bg">
      <section className="border-b border-nf-border">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          {/* te same okruszki co na /pro/[category]: wariant mono, bo to swiat Dog Store Pro */}
          <Breadcrumbs
            mono
            items={[{ label: "Dog Store Pro", href: "/pro" }, { label: t("inquiry.breadcrumb") }]}
          />

          <h1 className="type-h1 mt-6 text-white">{t("inquiry.heading")}</h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-nf-muted">
            {t("inquiry.intro")}
          </p>
        </div>
      </section>

      <section className="border-b border-nf-border">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <ul className="grid gap-px bg-nf-border md:grid-cols-2 lg:grid-cols-4">
            {terms.map((term) => (
              <li key={term.code} className="bg-nf-bg p-6">
                <span className="type-meta text-nf-dim">{term.code}</span>
                <h2 className="type-h3 mt-3 text-white">{term.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-nf-muted">{term.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${CONTAINER} py-16 md:py-24`}>
        <ProInquiryForm categories={categories} products={products} />
      </section>
    </div>
  );
}
