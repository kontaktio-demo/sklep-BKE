import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountOverview } from "@/components/account/AccountPages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("meta.account"), robots: { index: false, follow: false } };
}

export default function KontoPage() {
  return (
    <div className="bg-nf-bg">
      <AccountOverview />
    </div>
  );
}
