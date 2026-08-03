import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CartView } from "@/components/cart/CartView";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cart");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: "/koszyk" },
    // koszyk jest inny dla kazdego i nie ma czego indeksowac
    robots: { index: false, follow: true },
  };
}

export default async function CartPage() {
  const t = await getTranslations("cart");
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
      <Breadcrumbs
        items={[
          { label: t("breadcrumb.shop"), href: "/collections/collars" },
          { label: t("breadcrumb.cart") },
        ]}
      />

      <h1 className="type-h1 mt-6 text-nf-white">{t("title")}</h1>

      <div className="mt-12">
        <CartView />
      </div>
    </div>
  );
}
