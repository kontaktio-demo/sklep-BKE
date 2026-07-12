// neutral text badges - no trademark artwork (§12)

import { PAYMENT_METHODS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function PaymentIcons({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Akceptowane metody płatności"
      className={cn("flex flex-row flex-wrap gap-1.5", className)}
    >
      {PAYMENT_METHODS.map((method) => (
        <li
          key={method}
          className="flex h-6 items-center rounded-[3px] border border-nf-border bg-white/5 px-2 text-[9px] font-bold uppercase tracking-wide text-nf-muted"
        >
          {method}
        </li>
      ))}
    </ul>
  );
}
