"use client";

export function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  step?: number;
  formatValue?: (n: number) => string;
}) {
  const fmt = formatValue ?? ((n: number) => String(n));
  const range = max - min;
  const pct = (v: number) => (range <= 0 ? 0 : ((v - min) / range) * 100);
  const loPct = pct(value[0]);
  const hiPct = pct(value[1]);
  // when both thumbs sit at the right edge the min thumb must stack on top to stay grabbable
  const minOnTop = value[0] > min + range / 2;

  return (
    <div>
      <div className="relative h-11">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-nf-elevated-2" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-nf-red"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          className="nf-range absolute inset-0 h-full w-full"
          aria-label="Cena minimalna"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          style={{ zIndex: minOnTop ? 4 : 3 }}
          onChange={(e) => onChange([Math.min(Number(e.target.value), value[1]), value[1]])}
        />
        <input
          type="range"
          className="nf-range absolute inset-0 h-full w-full"
          aria-label="Cena maksymalna"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          style={{ zIndex: 3 }}
          onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0])])}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-nf-muted">
        <span>{fmt(value[0])}</span>
        <span>{fmt(value[1])}</span>
      </div>
      {/* only the thumbs are interactive so the two overlaid inputs don't block each other */}
      <style>{`
        .nf-range {
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
          background: transparent;
          pointer-events: none;
        }
        /* 44px hit target (§11) drawn as a 20px circle via background-clip */
        .nf-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 44px;
          height: 44px;
          border: 12px solid transparent;
          border-radius: 9999px;
          background: var(--color-nf-white);
          background-clip: content-box;
          box-shadow: none;
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
          cursor: pointer;
        }
        .nf-range::-moz-range-thumb {
          pointer-events: auto;
          width: 44px;
          height: 44px;
          border: 12px solid transparent;
          border-radius: 9999px;
          background: var(--color-nf-white);
          background-clip: content-box;
          box-shadow: none;
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
