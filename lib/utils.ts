export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const formatters = new Map<string, Intl.NumberFormat>();

export function formatPrice(price: number, currency = "PLN"): string {
  const key = `${currency}-${Number.isInteger(price) ? 0 : 2}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
      maximumFractionDigits: 2,
    });
    formatters.set(key, fmt);
  }
  return fmt.format(price);
}

// Polish plural forms: plural(1, "produkt", "produkty", "produktów") → "produkt"
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
