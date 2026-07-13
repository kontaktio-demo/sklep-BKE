import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Slot na fotografie. Zdjec jeszcze nie ma - wlasciciel poda wlasne, a generowanie
 * ich jest zakazane. Zamiast wstawiac atrape udajaca zdjecie, kafel pyta o plik:
 * jesli lezy w public/foto/<nazwa>, renderuje sie fotografia; jesli nie, kafel
 * zostaje plaska plaszczyzna z materialu (papier albo grafit).
 *
 * Sprawdzenie idzie po systemie plikow, wiec dziala tylko w komponencie serwerowym.
 * Wrzucenie pliku wystarczy: zaden kod nie wymaga zmiany.
 */
export function photo(name: string): string | null {
  const path = join(process.cwd(), "public", "foto", name);
  return existsSync(path) ? `/foto/${name}` : null;
}
