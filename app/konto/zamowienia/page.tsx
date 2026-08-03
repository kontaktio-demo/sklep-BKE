import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrdersView } from "@/components/account/AccountPages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("meta.orders"), robots: { index: false, follow: false } };
}

export default function OrdersPage() {
  return (
    <div className="bg-nf-bg">
      <OrdersView />
    </div>
  );
}
