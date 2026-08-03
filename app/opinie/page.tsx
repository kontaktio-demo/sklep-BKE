import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReviewClient } from "@/components/reviews/ReviewClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reviews");
  return { title: t("page.title"), robots: { index: false, follow: false } };
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const sp = await searchParams;
  const t = await getTranslations("reviews");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="type-h1 text-nf-white">{t("page.title")}</h1>
      <p className="mt-3 max-w-xl text-nf-muted">{t("page.lead")}</p>
      <div className="mt-8">
        <ReviewClient token={sp.t ?? ""} />
      </div>
    </div>
  );
}
