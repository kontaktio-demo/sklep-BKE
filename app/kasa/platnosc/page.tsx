import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PaymentClient } from "./PaymentClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return { title: t("meta.paymentTitle"), robots: { index: false, follow: false } };
}

export default function PaymentPage() {
  return (
    <div className="bg-nf-bg">
      <PaymentClient />
    </div>
  );
}
