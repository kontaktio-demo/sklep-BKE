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
  return (
    <span className={cn("text-sm font-medium text-nf-white", className)}>
      {fromPrice && <span className="font-normal text-nf-muted">od </span>}
      {formatPrice(price, currency)}
    </span>
  );
}
