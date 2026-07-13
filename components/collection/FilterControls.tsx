"use client";

import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import type { FilterGroup } from "@/lib/types";
import type { FilterState } from "@/lib/filtering";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/icons";
import { cn, formatPrice } from "@/lib/utils";

// §8-F fixed order; "price" has no FilterGroup and is rendered from bounds
const GROUP_ORDER = [
  "category",
  "type",
  "width",
  "size",
  "idPanel",
  "availability",
  "price",
  "color",
] as const;

type ArrayKey = "category" | "type" | "width" | "size" | "availability" | "color";

// Cialo sekcji zwija sie przez grid-template-rows 0fr -> 1fr, a to wymaga overflow-hidden.
// Kazda kontrolka w srodku ma wiec przyciete wszystko, co wychodzi poza jej pole: zwykla
// obwodka (2px linii + 2px odstepu + 4px czarnej otoczki) znikala od lewej i od prawej
// w calosci, bo wiersze filtrow siegaja krawedzi. Zapasu nie da sie tu dolozyc paddingiem:
// padding w pionie na kontenerze z overflow-hidden zablokowalby zwijanie do zera.
// Dlatego obwodka wchodzi do srodka kontrolki i czarna otoczka nie jest potrzebna.
const RING = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white focus-visible:shadow-none";

// Wariant dla kontrolek, gdzie fokus lapie element w srodku (checkbox w wierszu, przycisk
// probki koloru), a obwodka ma obrysowac caly wiersz: pierscien idzie na opakowanie,
// z elementu jest zdejmowany.
const RING_WITHIN =
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-white [&_:focus-visible]:outline-none [&_:focus-visible]:shadow-none";

export interface FilterControlsProps {
  groups: FilterGroup[];
  state: FilterState;
  onChange: (s: FilterState) => void;
  bounds: [number, number];
  colorHexes: Record<string, string>;
}

function withArray(state: FilterState, key: ArrayKey, value: string[]): FilterState {
  const next = { ...state };
  next[key] = value;
  return next;
}

function Section({
  label,
  active,
  onClear,
  children,
}: {
  label: string;
  active: boolean;
  onClear: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const bodyId = useId();

  return (
    <section className="border-b border-nf-border last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 w-full items-center justify-between gap-2 py-5 text-left"
        >
          <span className="text-xs uppercase tracking-widest text-nf-dim">{label}</span>
          <ChevronDownIcon
            className={cn(
              "shrink-0 text-nf-dim transition-transform duration-250 ease-nf motion-reduce:transition-none",
              open && "rotate-180"
            )}
          />
        </button>
      </h3>
      {/* Wysokosc animowana na grid-template-rows 0fr -> 1fr, bez mierzenia w JS.
          Zwiniete pola zostaja w DOM, wiec inert wycina je z kolejnosci tabulacji
          i z drzewa dostepnosci - tak jak wczesniej robilo to odmontowanie. */}
      <div
        id={bodyId}
        className={cn(
          "grid transition-[grid-template-rows] duration-250 ease-nf motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="pb-5">
            {children}
            {active && (
              <button
                type="button"
                onClick={onClear}
                className={cn(
                  "mt-1 inline-flex min-h-11 items-center rounded-[2px] px-1 text-xs uppercase tracking-widest text-nf-dim transition-colors duration-250 ease-nf hover:text-white",
                  RING
                )}
              >
                Wyczyść
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: FilterGroup["options"];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <ul>
      {options.map((opt) => {
        const isChecked = selected.includes(opt.value);
        return (
          <li key={opt.value}>
            {/* obwodka obrysowuje caly wiersz (44px), nie sam kwadracik 18px: w polu
                przycietym przez overflow-hidden pierscien wokol checkboxa i tak nie ma
                gdzie sie zmiescic, a wiersz jest czytelniejszym celem */}
            <label
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-[2px]",
                RING_WITHIN
              )}
            >
              <span className="relative flex size-[18px] shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(opt.value)}
                  className="peer size-[18px] appearance-none rounded-[2px] border border-nf-border-strong transition-colors duration-250 ease-nf checked:border-nf-red checked:bg-nf-red motion-reduce:transition-none"
                />
                <CheckIcon
                  width={12}
                  height={12}
                  strokeWidth={3}
                  className="pointer-events-none absolute inset-0 m-auto text-white opacity-0 transition-opacity duration-250 ease-nf peer-checked:opacity-100 motion-reduce:transition-none"
                />
              </span>
              <span
                className={cn(
                  "text-sm transition-colors duration-250 ease-nf motion-reduce:transition-none",
                  isChecked ? "text-white" : "text-nf-muted"
                )}
              >
                {opt.label}
              </span>
              <span className="ml-auto text-xs tabular-nums text-nf-dim">{opt.count}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function SwitchRow({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={cn("flex min-h-11 w-full items-center gap-3 rounded-[2px] text-left", RING)}
    >
      <span
        className={cn(
          "text-sm transition-colors duration-250 ease-nf motion-reduce:transition-none",
          checked ? "text-white" : "text-nf-muted"
        )}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto text-xs tabular-nums text-nf-dim">{count}</span>
      )}
      <span
        aria-hidden="true"
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-250 ease-nf motion-reduce:transition-none",
          // the count already carries ml-auto; without it the switch does the pushing
          count === undefined && "ml-auto",
          checked ? "bg-nf-red" : "bg-nf-elevated-2"
        )}
      >
        <span
          className={cn(
            "absolute left-[3px] top-[3px] size-[18px] rounded-full bg-white transition-transform duration-250 ease-nf motion-reduce:transition-none",
            checked && "translate-x-5"
          )}
        />
      </span>
    </button>
  );
}

function PriceSection({
  bounds,
  value,
  onPriceInput,
}: {
  bounds: [number, number];
  value: [number, number];
  onPriceInput: (lo: number, hi: number) => void;
}) {
  const fromId = useId();
  const toId = useId();
  const [lo, hi] = value;
  // typed input is a local draft committed on blur/Enter - clamping per keystroke
  // made values like "150" untypeable (the "1" clamped to the lower bound instantly)
  const [drafts, setDrafts] = useState<[string, string]>([String(lo), String(hi)]);

  useEffect(() => {
    setDrafts([String(lo), String(hi)]);
  }, [lo, hi]);

  const commit = () => {
    const parse = (s: string, fallback: number) => {
      const n = Number(s);
      return s.trim() === "" || Number.isNaN(n) ? fallback : n;
    };
    const clamp = (n: number) => Math.min(Math.max(n, bounds[0]), bounds[1]);
    let nextLo = clamp(parse(drafts[0], bounds[0]));
    let nextHi = clamp(parse(drafts[1], bounds[1]));
    if (nextLo > nextHi) [nextLo, nextHi] = [nextHi, nextLo];
    setDrafts([String(nextLo), String(nextHi)]);
    onPriceInput(nextLo, nextHi);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
  };

  const inputClasses = cn(
    "h-11 w-full rounded-[2px] border border-nf-border bg-nf-elevated px-3 text-sm text-nf-text",
    RING
  );

  return (
    <div>
      {/* Suwak nie przyjmuje klasy z zewnatrz, a jego dwa pola type=range siegaja pelnej
          szerokosci sekcji - obwodka na zewnatrz byla przycinana od lewej i prawej.
          Wciagamy ja do srodka po klasie toru (.nf-range). */}
      <div className="[&_.nf-range:focus-visible]:-outline-offset-2 [&_.nf-range:focus-visible]:outline-2 [&_.nf-range:focus-visible]:outline-white [&_.nf-range:focus-visible]:shadow-none">
        <RangeSlider
          min={bounds[0]}
          max={bounds[1]}
          value={value}
          onChange={(v) => onPriceInput(v[0], v[1])}
          formatValue={(n) => formatPrice(n)}
        />
      </div>
      <div className="mt-4 flex gap-3">
        <div className="flex-1">
          <label
            htmlFor={fromId}
            className="mb-1.5 block text-xs uppercase tracking-widest text-nf-dim"
          >
            Od
          </label>
          <input
            id={fromId}
            type="number"
            inputMode="numeric"
            min={bounds[0]}
            max={bounds[1]}
            value={drafts[0]}
            onChange={(e) => setDrafts([e.target.value, drafts[1]])}
            onBlur={commit}
            onKeyDown={onKeyDown}
            className={inputClasses}
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor={toId}
            className="mb-1.5 block text-xs uppercase tracking-widest text-nf-dim"
          >
            Do
          </label>
          <input
            id={toId}
            type="number"
            inputMode="numeric"
            min={bounds[0]}
            max={bounds[1]}
            value={drafts[1]}
            onChange={(e) => setDrafts([drafts[0], e.target.value])}
            onBlur={commit}
            onKeyDown={onKeyDown}
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
}

function ColorGrid({
  options,
  selected,
  colorHexes,
  onToggle,
}: {
  options: FilterGroup["options"];
  selected: string[];
  colorHexes: Record<string, string>;
  onToggle: (value: string) => void;
}) {
  return (
    <ul className="grid grid-cols-5 gap-2">
      {options.map((opt) => (
        <li
          key={opt.value}
          title={`${opt.label} (${opt.count})`}
          className={cn("flex flex-col items-center gap-1 rounded-[2px]", RING_WITHIN)}
        >
          <ColorSwatch
            size="md"
            color={{
              name: `${opt.label} (${opt.count})`,
              hex: colorHexes[opt.value] ?? "var(--color-nf-dim)",
            }}
            selected={selected.includes(opt.value)}
            onSelect={() => onToggle(opt.value)}
          />
          {/* §8-F: every option shows its count visibly, not only in the aria-label */}
          <span aria-hidden="true" className="text-[10px] leading-none tabular-nums text-nf-dim">
            {opt.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function FilterControls({ groups, state, onChange, bounds, colorHexes }: FilterControlsProps) {
  const price = state.price ?? bounds;

  const toggleArray = (key: ArrayKey, value: string) => {
    const current = state[key];
    onChange(
      withArray(
        state,
        key,
        current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      )
    );
  };

  const setPrice = (lo: number, hi: number) => {
    const clamp = (n: number) => Math.min(Math.max(n, bounds[0]), bounds[1]);
    let next: [number, number] = [clamp(lo), clamp(hi)];
    if (next[0] > next[1]) next = [next[1], next[0]];
    // full-range selection normalizes to null so it doesn't count as an active filter
    onChange({
      ...state,
      price: next[0] === bounds[0] && next[1] === bounds[1] ? null : next,
    });
  };

  return (
    <div>
      {GROUP_ORDER.map((id) => {
        if (id === "price") {
          return (
            <Section
              key="price"
              label="Cena"
              active={state.price !== null}
              onClear={() => onChange({ ...state, price: null })}
            >
              <PriceSection bounds={bounds} value={price} onPriceInput={setPrice} />
            </Section>
          );
        }

        const group = groups.find((g) => g.id === id);
        if (!group) return null;

        if (id === "idPanel") {
          return (
            <Section
              key={id}
              label={group.label}
              active={state.idPanel}
              onClear={() => onChange({ ...state, idPanel: false })}
            >
              <SwitchRow
                label={group.label}
                count={group.options[0]?.count}
                checked={state.idPanel}
                onToggle={() => onChange({ ...state, idPanel: !state.idPanel })}
              />
            </Section>
          );
        }

        if (id === "color") {
          return (
            <Section
              key={id}
              label={group.label}
              active={state.color.length > 0}
              onClear={() => onChange(withArray(state, "color", []))}
            >
              <ColorGrid
                options={group.options}
                selected={state.color}
                colorHexes={colorHexes}
                onToggle={(v) => toggleArray("color", v)}
              />
            </Section>
          );
        }

        return (
          <Section
            key={id}
            label={group.label}
            active={state[id].length > 0}
            onClear={() => onChange(withArray(state, id, []))}
          >
            <CheckboxGroup
              options={group.options}
              selected={state[id]}
              onToggle={(v) => toggleArray(id, v)}
            />
          </Section>
        );
      })}
    </div>
  );
}
