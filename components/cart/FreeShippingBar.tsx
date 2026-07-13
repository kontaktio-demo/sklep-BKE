import { FREE_SHIPPING_THRESHOLD } from "@/lib/nav";
import { cn, formatPrice } from "@/lib/utils";

/** Pasek postepu do darmowej dostawy. Ten sam w szufladzie i na stronie koszyka -
 *  prog i tekst musza brzmiec identycznie w obu miejscach, wiec zyja w jednym pliku. */
export function FreeShippingBar({
  subtotal,
  className,
}: {
  subtotal: number;
  className?: string;
}) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const reached = remaining === 0;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className={className}>
      <p className={cn("text-xs", reached ? "text-nf-text" : "text-nf-muted")}>
        {reached ? (
          "Dostawa gratis"
        ) : (
          <>
            Do darmowej dostawy brakuje{" "}
            <span className="font-medium text-nf-white">{formatPrice(remaining)}</span>
          </>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Postęp do darmowej dostawy"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
        aria-valuetext={
          reached ? "Dostawa gratis" : `Brakuje ${formatPrice(remaining)} do darmowej dostawy`
        }
        className="mt-2 h-1 w-full overflow-hidden rounded-[2px] bg-nf-elevated-2"
      >
        <div
          className="h-full bg-nf-red transition-[width] duration-250 ease-nf motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
