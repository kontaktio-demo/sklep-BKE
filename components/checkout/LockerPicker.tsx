"use client";

import { useEffect, useRef } from "react";

/**
 * Wybór paczkomatu InPost.
 * - Gdy ustawiony NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN: ładuje oficjalny geowidget (mapa punktów)
 *   i po wyborze ustawia kod paczkomatu — mniej literówek, mniej nieudanych etykiet.
 * - Bez tokenu: zwykłe pole na kod (fallback), więc kasa działa też przed konfiguracją.
 */
const TOKEN = process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN ?? "";
const GEO_JS = "https://geowidget.inpost.pl/inpost-geowidget.js";
const GEO_CSS = "https://geowidget.inpost.pl/inpost-geowidget.css";

export function LockerPicker({
  value,
  onChange,
  locale,
  inputClass,
  placeholder,
  chosenLabel,
}: {
  value: string;
  onChange: (code: string) => void;
  locale: string;
  inputClass: string;
  placeholder: string;
  chosenLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!TOKEN) return;
    const lang = locale === "en" ? "en" : "pl";

    if (!document.querySelector(`link[data-inpost]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = GEO_CSS;
      link.dataset.inpost = "1";
      document.head.appendChild(link);
    }

    const mount = () => {
      const c = containerRef.current;
      if (!c || c.querySelector("inpost-geowidget")) return;
      const el = document.createElement("inpost-geowidget");
      el.setAttribute("token", TOKEN);
      el.setAttribute("language", lang);
      el.setAttribute("config", "parcelCollect");
      el.style.height = "460px";
      el.style.display = "block";
      el.addEventListener("onpoint", (e: Event) => {
        const detail = (e as CustomEvent).detail as { name?: string } | undefined;
        if (detail?.name) onChangeRef.current(detail.name);
      });
      c.appendChild(el);
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[data-inpost]`);
    if (existing) {
      if (existing.dataset.loaded) mount();
      else existing.addEventListener("load", mount);
    } else {
      const s = document.createElement("script");
      s.src = GEO_JS;
      s.defer = true;
      s.dataset.inpost = "1";
      s.addEventListener("load", () => {
        s.dataset.loaded = "1";
        mount();
      });
      document.head.appendChild(s);
    }
  }, [locale]);

  // Fallback bez tokenu: samo pole na kod.
  if (!TOKEN) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className={inputClass}
      />
    );
  }

  return (
    <div>
      <div ref={containerRef} className="overflow-hidden rounded-[2px] border border-nf-border" />
      {value && (
        <p className="mt-2 text-sm text-nf-text">
          {chosenLabel} <span className="font-mono">{value}</span>
        </p>
      )}
      {/* ukryte pole trzyma wybrany kod dla walidacji/formularza */}
      <input type="hidden" value={value} readOnly required />
    </div>
  );
}
