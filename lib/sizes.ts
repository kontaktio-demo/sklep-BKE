import type { CollarSize, CollarWidth } from "@/lib/types";

// Jedyne zrodlo etykiet rozmiaru i szerokosci. Wczesniej filtr mowil "Duzy (48 cm+)",
// a karta produktu "Duzy (48-60 cm)" - dwa rozne zakresy dla tego samego rozmiaru.
// Wszystko, co pokazuje rozmiar uzytkownikowi, czyta stad.

/** Krotka nazwa rozmiaru - kolumna tabeli rozmiarow. */
export const SIZE_NAME: Record<CollarSize, string> = {
  small: "Mały",
  medium: "Średni",
  large: "Duży",
};

/** Obwod szyi. Zakresy sa domkniete - "48 cm+" nie mowilo, gdzie konczy sie rozmiar. */
export const SIZE_NECK: Record<CollarSize, string> = {
  small: "28-36 cm",
  medium: "38-46 cm",
  large: "48-60 cm",
};

/** Waga psa - wylacznie orientacyjna, decyduje pomiar obwodu. */
export const SIZE_WEIGHT: Record<CollarSize, string> = {
  small: "8-15 kg",
  medium: "15-30 kg",
  large: "30 kg i więcej",
};

/** Pelna etykieta: nazwa + obwod. Filtry, karta produktu, szybki podglad. */
export const SIZE_LABEL: Record<CollarSize, string> = {
  small: `${SIZE_NAME.small} (${SIZE_NECK.small})`,
  medium: `${SIZE_NAME.medium} (${SIZE_NECK.medium})`,
  large: `${SIZE_NAME.large} (${SIZE_NECK.large})`,
};

/** Szerokosc tasmy w cm. Klucz to cal, bo tak przychodzi z danych. */
export const WIDTH_LABEL: Record<CollarWidth, string> = {
  "1": "2,5 cm",
  "1.5": "4 cm",
  "1.75": "4,5 cm",
};

/** Kolejnosc od najmniejszego - filtry i tabela rozmiarow ida tym porzadkiem. */
export const SIZE_ORDER: readonly CollarSize[] = ["small", "medium", "large"];
export const WIDTH_ORDER: readonly CollarWidth[] = ["1", "1.5", "1.75"];
