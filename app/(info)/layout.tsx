// Wspolna powloka stron informacyjnych (kontakt, dostawa, zwroty, gwarancja, rozmiary,
// regulamin, polityka prywatnosci, o nas). Ciemny motyw jak reszta sklepu - jasny zostaje
// wylacznie stronie glownej. Waska kolumna: to sa strony do czytania, nie do przegladania.

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 md:px-6 md:py-24">{children}</div>
  );
}
