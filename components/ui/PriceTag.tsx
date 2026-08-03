import { useTranslations } from "next-intl";
import { cn, formatPrice } from "@/lib/utils";

export function PriceTag({
  price,
  fromPrice,
  currency,
  className,
}: {
  price: number;
  fromPrice: boolean;
  currency: string;
  className?: string;
}) {
  const t = useTranslations("misc");
  return (
    <span className={cn("text-sm font-medium text-nf-white", className)}>
      {fromPrice && <span className="font-normal text-nf-muted">{t("priceTag.from")} </span>}
      {formatPrice(price, currency)}
    </span>
  );
}
