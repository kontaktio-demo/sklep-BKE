import type { Product } from "../types";

// Pytania z obslugi zamowien, nie z generatora tresci. Kazdy zestaw odpowiada na to,
// co kupujacy sprawdza PRZED dodaniem do koszyka: czy sprzet zniesie ciagniecie, jak
// dobrac rozmiar, czego producent NIE zaleca. Odpowiedz, ktora czegos odradza, jest
// tu wiecej warta niz odpowiedz, ktora sprzedaje.

export interface FaqItem {
  /** stabilny klucz listy - nie zmieniaj po publikacji, jest kotwica dla linkow */
  id: string;
  question: string;
  answer: string;
}

/** Zestaw dobierany po tym, czym produkt JEST, a nie po kategorii w menu. */
type FaqVariant = "e-collar" | "chain" | "id-panel" | "collar";

const SIZE_GROWING: FaqItem = {
  id: "rozmiar-rosnacy",
  question: "Jak dobrać rozmiar dla rosnącego psa?",
  answer:
    "Mierz obwód szyi teraz i dodaj 2-3 cm luzu. Rozmiar na wyrost nie zdaje egzaminu: obroża zsuwa się psu przez głowę, a zapięta na skrajnym otworze pracuje na najsłabszym punkcie taśmy. Pies rosnący do wagi docelowej z reguły potrzebuje dwóch obroży po kolei, dlatego na wymianę rozmiaru dajemy 60 dni.",
};

const FIT_TWO_FINGERS: FaqItem = {
  id: "luz",
  question: "Ile luzu zostawić pod obrożą?",
  answer:
    "Dwa palce wchodzą swobodnie między taśmę a szyję. Mniej oznacza ucisk i przetarcia, więcej oznacza, że pies wysunie głowę przy pierwszym gwałtownym szarpnięciu w bok.",
};

const NIGHT_OFF: FaqItem = {
  id: "noc",
  question: "Czy zostawiać obrożę na psie bez nadzoru?",
  answer:
    "Nie zalecamy. Klamra i D-ring mogą zahaczyć o kratę kojca, siatkę lub zęby drugiego psa. Obrożę zakładamy do wyjścia i pracy, a w kojcu i na noc zdejmujemy. Dotyczy to każdej obroży z okuciami, nie tylko naszych.",
};

const FAQ: Record<FaqVariant, FaqItem[]> = {
  // pasy pod modul e-obrozy: pytania kreca sie wokol tego, czy sprzet, ktory kupujacy
  // juz ma, w ogole na nich siadzie
  "e-collar": [
    {
      id: "przepiecie-modulu",
      question: "Czy moduł da się przepiąć między obrożami?",
      answer:
        "Tak. Moduł wypina się z prowadnic razem z elektrodami i przechodzi na drugi pas w kilkanaście sekund, bez narzędzi. Warunek jest jeden: obudowa musi mieścić się w prowadnicach obu pasów, czyli mieć do 45 mm szerokości.",
    },
    {
      id: "zgodnosc-modelu",
      question: "Czy pas pasuje do mojego modelu e-obroży?",
      answer:
        "O zgodności decyduje szerokość obudowy modułu, nie marka nadajnika. Zmierz obudowę w miejscu, w którym przechodzi przez pas, i porównaj z tabelą w sekcji Zgodność. Do 45 mm pasuje, powyżej nie ma szans na stabilny montaż.",
    },
    {
      id: "nadajnik-w-zestawie",
      question: "Czy w zestawie jest moduł i pilot?",
      answer:
        "Nie. Sprzedajemy sam pas nośny. Moduł, elektrody i pilot zostają te, które już masz, a pas zastępuje fabryczny pasek, który zwykle jest najsłabszym elementem takiego kompletu.",
    },
    {
      id: "elektrody-kontakt",
      question: "Co zrobić, gdy elektrody tracą kontakt przy gęstej sierści?",
      answer:
        "Nie strzyż psa. Załóż dłuższe elektrody dostarczone przez producenta modułu i dociągnij pas o jeden otwór, tak żeby dwa palce nadal wchodziły pod taśmę. Elektrody muszą dotykać skóry stale, inaczej moduł działa z przerwami i pies dostaje niespójny sygnał.",
    },
    {
      id: "czas-noszenia",
      question: "Jak długo pies może pracować w pasie z modułem?",
      answer:
        "Zdejmuj pas po sesji, a przy dłuższej pracy przekładaj moduł na drugą stronę szyi co kilka godzin. Odparzenia pod elektrodami biorą się z ucisku i ciągłego noszenia, nie z impulsu. Noszenia bez przerwy powyżej 8 godzin nie zalecamy.",
    },
  ],

  // lancuszki: kupujacy pyta o sierc i o to, czy to nie jest sprzet, ktory zaszkodzi psu
  chain: [
    {
      id: "siersc",
      question: "Czy łańcuszek nie niszczy sierści?",
      answer:
        "Przy dobrze dobranym rozmiarze ogniwa nie przecierają włosa: obroża wisi luźno i pracuje tylko w momencie napięcia. Sierść wyciera się wtedy, gdy łańcuszek jest za długi i przez cały spacer przesuwa się po szyi. Przy psach długowłosych i z filcującym się podszerstkiem uczciwiej jest wziąć taśmę nylonową.",
    },
    {
      id: "polzaciskowa-vs-zaciskowa",
      question: "Czym różni się obroża półzaciskowa od zaciskowej?",
      answer:
        "Półzaciskowa ma ogranicznik: pętla domyka się do ustalonego obwodu szyi i dalej się nie zaciska. Zaciskowa ogranicznika nie ma. Do spacerów i do psów, które wysuwają głowę z obroży płaskiej, bierz półzaciskową. Zaciskową zostaw do pracy pod okiem instruktora.",
    },
    {
      id: "rozmiar-lancuszka",
      question: "Jak dobrać rozmiar łańcuszka?",
      answer:
        "Mierz obwód głowy przez uszy w najszerszym miejscu, nie sam obwód szyi. Łańcuszek musi przejść przez czaszkę, a po zapięciu zwisać najwyżej kilka centymetrów. Za długi obija się o kark i przesuwa po sierści, za krótki nie wejdzie na głowę.",
    },
    {
      id: "lancuszek-na-stale",
      question: "Czy łańcuszek można zostawić na psie na stałe?",
      answer:
        "Nie. To sprzęt do pracy pod prowadzeniem przewodnika, zakładany na czas sesji i zdejmowany po niej. Ogniwa zahaczają o kratę, siatkę i obrożę drugiego psa, a przy wersji zaciskowej ryzyko uduszenia jest realne. Do noszenia na co dzień, z adresówką, użyj obroży nylonowej.",
    },
    {
      id: "stal-korozja",
      question: "Czy stal rdzewieje po zimie?",
      answer:
        "Ogniwa i D-ring są ze stali nierdzewnej, polerowanej, więc nie korodują. Sól drogowa zostawia jednak na nich osad, który zbiera się w przegubach ogniw. Po pracy w soli lub błocie przepłucz łańcuszek czystą wodą i wysusz przed schowaniem.",
    },
  ],

  // obroze z panelem ID: pytania o to, czy identyfikacja wytrzyma prawdziwa prace
  "id-panel": [
    {
      id: "panel-szarpniecie",
      question: "Czy panel ID trzyma przy szarpnięciu?",
      answer:
        "Rzep na całej długości taśmy trzyma panel przy pracy na smyczy i przy gwałtownym szarpnięciu. Panel nie jest jednak elementem nośnym: siłę przenosi taśma i D-ring, a nie rzep. Przy przeciąganiu psa przez gęste zarośla panel może zostać zdarty i tak ma być, bo alternatywą jest rozerwana taśma.",
    },
    {
      id: "panel-przesuwanie",
      question: "Czy panel można przesuwać po obroży?",
      answer:
        "Tak, rzep biegnie przez całą taśmę, więc panel siada w dowolnym miejscu obwodu. Ustaw go z boku szyi: tam jest czytelny dla człowieka, który podejdzie do psa, i nie wchodzi pod karabińczyk smyczy.",
    },
    {
      id: "panel-tresc",
      question: "Co umieścić na panelu?",
      answer:
        "Numer telefonu i imię psa. Adresu domowego nie polecamy, bo panel czyta każdy, kto podejdzie do psa. Panel nie zastępuje czipa, tylko skraca drogę do kontaktu: znalazca dzwoni od razu, zamiast szukać czytnika.",
    },
    SIZE_GROWING,
    {
      id: "panel-ciagniecie",
      question: "Czy obroża z panelem nadaje się do psa, który ciągnie?",
      answer:
        "Tak, panel nie zmienia nośności taśmy. Przy psie, który ciągnie stale, wybieraj szerszą taśmę, bo rozkłada nacisk na większą powierzchnię szyi. Sama obroża nie nauczy jednak psa chodzić przy nodze i nie jest sprzętem korekcyjnym.",
    },
  ],

  // zwykle obroze plaskie: nylon, praca i codziennosc
  collar: [
    {
      id: "ciagniecie",
      question: "Czy obroża nadaje się do psa, który ciągnie na smyczy?",
      answer:
        "Taśma i D-ring przenoszą obciążenie przy ciągnięciu, więc konstrukcja to wytrzyma. Przy psie, który ciągnie przez cały spacer, bierz szerszą taśmę: ten sam nacisk rozkłada się na większą powierzchnię szyi. Obroża nie zastąpi jednak nauki chodzenia przy nodze, a przy psach z problemami oddechowymi lepszym wyborem są szelki.",
    },
    SIZE_GROWING,
    FIT_TWO_FINGERS,
    {
      id: "woda",
      question: "Czy obroża zniesie pływanie i pracę w wodzie?",
      answer:
        "Nylon nie chłonie wody tak jak skóra i schnie w kilkadziesiąt minut. Po kąpieli w morzu lub po błocie przepłucz obrożę czystą wodą: osad z soli i piasku zbiera się w sprężynie klamry i to on, a nie sama woda, kończy jej żywot.",
    },
    NIGHT_OFF,
  ],
};

/**
 * Zestaw pytan dla karty produktu. Kolejnosc rozstrzygania ma znaczenie: pas pod modul
 * e-obrozy jest najpierw pasem pod modul, a dopiero potem obroza z rzepem na panel ID.
 */
export function getProductFaq(product: Product): FaqItem[] {
  if (product.category === "e-collar" || product.proCategory === "e-collar") {
    return FAQ["e-collar"];
  }
  if (product.type === "chain") return FAQ.chain;
  if (product.idPanelCompatible) return FAQ["id-panel"];
  return FAQ.collar;
}
