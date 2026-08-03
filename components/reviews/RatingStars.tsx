import { cn } from "@/lib/utils";

/** Gwiazdki oceny (prezentacyjne). value 0–5, może być ułamkowe (średnia). */
export function RatingStars({
  value,
  size = 16,
  className,
  label,
}: {
  value: number;
  size?: number;
  className?: string;
  label?: string;
}) {
  const rounded = Math.round(value * 2) / 2; // do połówek
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? "full" : rounded >= i - 0.5 ? "half" : "empty";
        return <Star key={i} size={size} fill={fill} />;
      })}
    </span>
  );
}

function Star({ size, fill }: { size: number; fill: "full" | "half" | "empty" }) {
  const id = `half-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      {fill === "half" && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.6.94-5.5-4-3.9 5.53-.8z"
        fill={fill === "full" ? "currentColor" : fill === "half" ? `url(#${id})` : "transparent"}
        stroke="currentColor"
        strokeWidth="1"
        className="text-nf-red"
      />
    </svg>
  );
}
