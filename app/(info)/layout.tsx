// Wspolna powloka stron informacyjnych (kontakt, dostawa, zwroty, gwarancja, rozmiary,
// regulamin, polityka prywatnosci, o nas). Jasny motyw jak reszta sklepu cywilnego - grafit
// zostaje wylacznie sekcji Dog Store Pro. Kolory nie sa tu ustawiane recznie: strony stoja na
// tokenach nf-*, ktore odwracaja sie same zaleznie od swiata.
//
// Kontener jest ten sam co w calym serwisie (max-w-[1600px] px-4 md:px-6), zeby tytul
// strony zaczynal sie dokladnie pod logo w naglowku. Waska kolumna czytelnicza (900px)
// siedzi w srodku i trzyma sie lewej krawedzi siatki - to strony do czytania, wiec dlugosc
// wiersza zostaje ograniczona, ale nie kosztem wspolnej osi.

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
      <div className="max-w-[900px]">{children}</div>
    </div>
  );
}
