export interface ProductCopy {
  tagline: string;
  description: string;
  highlights: string[];
}

export const productCopy: Record<string, ProductCopy> = {
  "ranger-duty-collar": {
    tagline: "Taśma 1000D, panel ID, praca w terenie",
    description:
      "Podstawowa obroża do pracy z psem służbowym. Taśma nylonowa 1000D o szerokości 4,5 cm rozkłada nacisk przy silnym ciągnięciu, a wyściółka z neoprenu chroni sierść na karku. Rzep biegnie przez całą długość i przyjmuje panele identyfikacyjne oraz naszywki.",
    highlights: [
      "Taśma 1000D, szerokość 4,5 cm",
      "Rzep na panel ID i naszywki",
      "Klamra zatrzaskowa, stop cynku",
      "Obwód 48-60 cm",
    ],
  },

  "fjord-everyday-collar": {
    tagline: "Wąska obroża na co dzień",
    description:
      "Wersja na spacer i dom, bez elementów typowych dla obroży roboczych. Taśma 2,5 cm z neoprenową wyściółką nie zbiera wody i schnie w kilkadziesiąt minut po deszczu. Klamra zatrzaskowa ze stopu cynku pozwala zdjąć obrożę jedną ręką, bez odpinania smyczy.",
    highlights: [
      "Szerokość 2,5 cm",
      "Obwód szyi 28-36 cm",
      "Wyściółka z neoprenu",
      "Trzy kolory taśmy",
    ],
  },

  "sentinel-id-collar": {
    tagline: "Panel ID na całej długości taśmy",
    description:
      "Konstrukcja pod identyfikację. Rzep biegnie przez całą taśmę, więc panel z imieniem i numerem telefonu można przesunąć w dowolne miejsce i nie zostaje luz. Szerokość 4,5 cm utrzymuje sztywność przy zapiętej smyczy, a D-ring siedzi tuż za klamrą i nie wędruje po obwodzie.",
    highlights: [
      "Rzep na całej długości",
      "Taśma 1000D, szerokość 4,5 cm",
      "Obwód 38-46 cm",
      "D-ring blokowany przy klamrze",
    ],
  },

  "bolt-e-fit-collar": {
    tagline: "Pasek pod moduł e-obroży, szerokość 4 cm",
    description:
      "Pasek nośny do modułu e-obroży: mieści obudowy o szerokości do 45 mm i utrzymuje elektrody w stałym kontakcie z szyją. Taśma 4 cm nie skręca się pod ciężarem nadajnika. Rzep przyjmuje panel ID, więc pies pracuje bez zakładania drugiej obroży.",
    highlights: [
      "Zgodna z modułami do 45 mm",
      "Szerokość taśmy 4 cm",
      "Rzep na panel ID",
      "Obwód 38-46 cm",
    ],
  },

  "vanguard-k9-collar": {
    tagline: "Szeroka taśma robocza z panelem ID",
    description:
      "Obroża do szkolenia i pracy z dużym psem. Taśma 1000D o szerokości 4,5 cm oraz obwód 48-60 cm dają zapas regulacji na zimową okrywę. Okucia ze stopu cynku, klamra zatrzaskowa zapinana jedną ręką, także w rękawicy. Rzep pod panele identyfikacyjne biegnie przez całą taśmę.",
    highlights: [
      "Taśma 1000D, szerokość 4,5 cm",
      "Obwód 48-60 cm",
      "Rzep na panele identyfikacyjne",
      "Okucia ze stopu cynku",
    ],
  },

  "nightwatch-reflective-collar": {
    tagline: "Odblaskowa taśma na wieczorne spacery",
    description:
      "Taśma 2,5 cm z wszytą nicią odblaskową po obu stronach, widoczną w świetle reflektorów z kilkudziesięciu metrów. Wersja pomarańczowa czyta się także za dnia, w lesie i przy drodze. Neoprenowa wyściółka ogranicza obcieranie u psów z krótką sierścią.",
    highlights: [
      "Nić odblaskowa po obu stronach",
      "Szerokość 2,5 cm",
      "Obwód 38-46 cm",
      "Czarny i pomarańczowy",
    ],
  },

  "grizzly-alpine-collar": {
    tagline: "Trekking, duży pies, taśma 4 cm",
    description:
      "Na dłuższe wyjścia w góry i całodniowe trasy. Taśma 4 cm rozkłada nacisk w miejscu, gdzie ocierają szelki i pas plecaka, a neopren pod spodem nie chłonie wody z mokrej trawy ani śniegu. Trzy stonowane kolory dobrane pod sprzęt turystyczny.",
    highlights: [
      "Szerokość 4 cm",
      "Obwód 48-60 cm",
      "Neopren odporny na wilgoć",
      "Oliwka, granat, coyote",
    ],
  },

  "ridgeline-field-collar": {
    tagline: "Robocza taśma 4 cm z rzepem",
    description:
      "Obroża do pracy w polu i lesie. Węższa od modeli 4,5 cm, więc mniej waży przy całodziennym marszu, ale zachowuje rzep pod panel identyfikacyjny. Kolory oliwkowy i coyote nie odcinają się od poszycia i nie płowieją tak szybko jak taśma czarna.",
    highlights: [
      "Taśma 1000D, szerokość 4 cm",
      "Rzep na panel ID",
      "Obwód 48-60 cm",
      "Klamra zatrzaskowa ze stopu cynku",
    ],
  },

  "bastion-heavy-collar": {
    tagline: "Wzmocniona taśma do psów ciągnących",
    description:
      "Najcięższa konstrukcja w serii roboczej. Dwie warstwy taśmy 1000D zszyte na szerokości 4,5 cm, do psów, które pracują na napiętej smyczy i obciążają D-ring bokiem. Rzep na całej długości trzyma panel ID w miejscu nawet przy szarpnięciu.",
    highlights: [
      "Dwie warstwy taśmy 1000D",
      "Szerokość 4,5 cm",
      "Obwód 48-60 cm",
      "Rzep na panel ID",
    ],
  },

  "halo-comfort-collar": {
    tagline: "Miękka obroża 4 cm na co dzień",
    description:
      "Szeroka taśma przy niskiej wadze. Nacisk rozkłada się na większą powierzchnię niż w obrożach 2,5 cm, co ma znaczenie u psów z wrażliwą skórą i cienką sierścią. Wyściółka z neoprenu zaokrąglona na krawędziach, bez rzepu i bez okuć roboczych.",
    highlights: [
      "Szerokość 4 cm",
      "Obwód 38-46 cm",
      "Wyściółka z neoprenu",
      "Bez panelu ID",
    ],
  },

  "havoc-chain-martingale": {
    tagline: "Półzaciskowa, stal nierdzewna, ogniwa spawane",
    description:
      "Obroża półzaciskowa: pętla domyka się do ustalonego obwodu i dalej się nie zaciska. Ogniwa spawane ze stali nierdzewnej, polerowane, bez ostrych krawędzi po stronie wewnętrznej. Rozwiązanie dla psów, które wysuwają głowę z obroży płaskiej.",
    highlights: [
      "Stal nierdzewna, polerowana",
      "Ogniwa spawane, bez ostrych krawędzi",
      "Ogranicznik zacisku pętli",
      "Obwód 48-60 cm",
    ],
  },

  "onyx-slip-chain": {
    tagline: "Zaciskowa obroża szkoleniowa ze stali",
    description:
      "Obroża zaciskowa do pracy pod okiem instruktora. Ogniwa spawane i polerowane przesuwają się bez zacięć, D-ring ze stali. Wymaga prawidłowego zakładania i nie jest przeznaczona do zostawiania psa bez opieki ani do noszenia na co dzień.",
    highlights: [
      "Stal nierdzewna, polerowana",
      "Ogniwa spawane, gładkie krawędzie",
      "Obwód 38-46 cm",
      "Do pracy pod nadzorem",
    ],
  },

  "pulse-e-collar-strap": {
    tagline: "Lekki pasek pod moduł e-obroży",
    description:
      "Zamiennik fabrycznego paska w e-obrożach. Szerokość 2,5 cm ogranicza masę na szyi, a taśma trzyma moduł o obudowie do 45 mm i nie pozwala mu się obracać. Trzy kolory ułatwiają rozróżnienie psów pracujących w grupie. Wersja bez rzepu na panel ID.",
    highlights: [
      "Zgodna z modułami do 45 mm",
      "Szerokość 2,5 cm",
      "Obwód 38-46 cm",
      "Czarny, czerwony, pomarańczowy",
    ],
  },

  "aurora-padded-collar": {
    tagline: "Wyściełana taśma 4 cm dla małych psów",
    description:
      "Szeroka taśma na małą szyję. Cztery centymetry przy obwodzie 28-36 cm rozkładają nacisk tam, gdzie wąska obroża zostawia zagniecenie w sierści. Wyściółka z neoprenu wykończona na miękko, okucia ze stopu cynku. Kolory: piaskowy, biały i granatowy.",
    highlights: [
      "Szerokość 4 cm",
      "Obwód 28-36 cm",
      "Wyściółka z neoprenu",
      "Klamra zatrzaskowa, stop cynku",
    ],
  },

  "timber-trail-collar": {
    tagline: "Spacerowa obroża 4 cm, kolory terenowe",
    description:
      "Model na codzienne trasy poza miastem. Taśma 4 cm, wyściółka z neoprenu, okucia ze stopu cynku, czyli konstrukcja jak w modelach roboczych, ale bez rzepu i bez zapasu taśmy pod moduły. Coyote i oliwka znoszą kurz i błoto lepiej niż jasne kolory.",
    highlights: [
      "Szerokość 4 cm",
      "Obwód 38-46 cm",
      "Bez panelu ID",
      "Coyote i oliwkowy",
    ],
  },

  "drift-coastal-collar": {
    tagline: "Lekka taśma 2,5 cm, szybko schnie",
    description:
      "Obroża do wody i piachu. Neopren nie nasiąka, a taśma 2,5 cm schnie szybciej niż szersze modele, więc po kąpieli nie zostaje wilgotny pas pod sierścią. Okucia ze stopu cynku, bez elementów stalowych, które mogłyby korodować od soli.",
    highlights: [
      "Szerokość 2,5 cm",
      "Obwód 28-36 cm",
      "Neopren nie nasiąka wodą",
      "Okucia ze stopu cynku",
    ],
  },

  "cipher-tactical-collar": {
    tagline: "Taśma 4,5 cm, pełny rzep, niski profil",
    description:
      "Szerokość 4,5 cm przy obwodzie 38-46 cm, czyli największa powierzchnia nacisku, jaką da się rozłożyć na średniej szyi. Rzep na całej długości przyjmuje panele ID i oznaczenia funkcyjne. Trzy kolory kryjące: czarny, oliwkowy i coyote.",
    highlights: [
      "Taśma 1000D, szerokość 4,5 cm",
      "Rzep na całej długości",
      "Obwód 38-46 cm",
      "Klamra zatrzaskowa, stop cynku",
    ],
  },

  "ember-reflective-collar": {
    tagline: "Odblask i kolor sygnałowy dla małych psów",
    description:
      "Czerwona albo pomarańczowa taśma z nicią odblaskową. Kolor pracuje przy świetle dziennym, odblask po zmroku i w reflektorach samochodu. Szerokość 2,5 cm, obwód 28-36 cm, wyściółka z neoprenu na całej długości taśmy. Klamra zatrzaskowa ze stopu cynku.",
    highlights: [
      "Nić odblaskowa w taśmie",
      "Szerokość 2,5 cm",
      "Obwód 28-36 cm",
      "Czerwony i pomarańczowy",
    ],
  },

  "torque-chain-collar": {
    tagline: "Łańcuch stalowy 4 cm do pracy",
    description:
      "Obroża łańcuszkowa o szerokim profilu. Ogniwa spawane ze stali nierdzewnej, polerowane, D-ring stalowy, bez taśmy i bez wyściółki. Masa łańcucha i jego dźwięk są tu częścią sygnału dla psa. Do szkolenia prowadzonego przez przewodnika.",
    highlights: [
      "Stal nierdzewna, polerowana",
      "Ogniwa spawane, D-ring stalowy",
      "Szerokość 4 cm",
      "Obwód 48-60 cm",
    ],
  },

  "willow-heritage-collar": {
    tagline: "Klasyczna wąska obroża, jasna taśma",
    description:
      "Prosty model bez rzepu i bez okuć roboczych. Taśma 2,5 cm w kolorze piaskowym lub białym, klamra zatrzaskowa, D-ring ze stopu cynku. Wyściółka z neoprenu podszyta pod całą długością taśmy, obwód szyi 38-46 cm. Krawędzie taśmy zgrzewane, nie strzępią się na końcach.",
    highlights: [
      "Szerokość 2,5 cm",
      "Obwód 38-46 cm",
      "Piaskowy lub biały",
      "Bez panelu ID",
    ],
  },

  "strike-e-fit-pro-collar": {
    tagline: "Szeroki pasek e-obroży z panelem ID",
    description:
      "Wersja pod moduły e-obroży dla dużych psów. Taśma 4,5 cm utrzymuje obudowę do 45 mm w jednej pozycji także przy biegu w gęstym poszyciu. Rzep na całej długości mieści panel ID obok modułu, obwód regulowany w zakresie 48-60 cm.",
    highlights: [
      "Zgodna z modułami do 45 mm",
      "Taśma 1000D, szerokość 4,5 cm",
      "Rzep na panel ID",
      "Obwód 48-60 cm",
    ],
  },

  "kodiak-duty-collar": {
    tagline: "Obroża służbowa do pracy całodziennej",
    description:
      "Dla przewodników, którzy pracują z psem po kilka godzin dziennie. Taśma 1000D o szerokości 4,5 cm, wyściółka z neoprenu na całej długości, okucia ze stopu cynku. Rzep mieści panel ID i oznaczenia funkcyjne, obwód 48-60 cm.",
    highlights: [
      "Taśma 1000D, szerokość 4,5 cm",
      "Rzep na panel ID",
      "Obwód 48-60 cm",
      "Wyściółka z neoprenu",
    ],
  },

  "meadow-soft-collar": {
    tagline: "Wąska obroża dla szczeniąt i małych psów",
    description:
      "Najlżejszy model w ofercie. Taśma 2,5 cm i obwód 28-36 cm pasują na szczenięta oraz psy małych ras. Neoprenowa wyściółka zmniejsza tarcie na miękkiej sierści, klamra zatrzaskowa zapina się jedną ręką, bez ściągania obroży przez głowę.",
    highlights: [
      "Szerokość 2,5 cm",
      "Obwód 28-36 cm",
      "Wyściółka z neoprenu",
      "Trzy kolory taśmy",
    ],
  },

  "breeze-mesh-collar": {
    tagline: "Wentylowana obroża na ciepłe miesiące",
    description:
      "Taśma nylonowa 2,5 cm, a pod nią wyściółka z neoprenu kryta siatką. Powietrze przechodzi pod obrożą, więc po upalnym spacerze nie zostaje wilgotny pas przy skórze. Rozmiar na obwód szyi 28-36 cm, kolory szary i granatowy.",
    highlights: [
      "Neopren kryty siatką",
      "Szerokość 2,5 cm",
      "Obwód 28-36 cm",
      "Szary i granatowy",
    ],
  },

  "surge-e-fit-collar": {
    tagline: "Pasek e-obroży w rozmiarze małym",
    description:
      "Najmniejszy pasek pod moduł w ofercie: obwód 28-36 cm przy taśmie o szerokości 4 cm. Sztywność szerokiej taśmy utrzymuje elektrody w kontakcie z szyją także u psów o wąskim karku. Rzep mieści panel ID, moduł do 45 mm. Taśma czarna, bez nici odblaskowej.",
    highlights: [
      "Zgodna z modułami do 45 mm",
      "Szerokość 4 cm",
      "Obwód 28-36 cm",
      "Rzep na panel ID",
    ],
  },

  "raptor-e-fit-field-collar": {
    tagline: "Pasek e-obroży do pracy w terenie",
    description:
      "Wersja terenowa: taśma 4 cm w kolorze oliwkowym lub czarnym, rzep pod panel ID i moduł o obudowie do 45 mm. Wyściółka z neoprenu nie chłonie wody, więc obroża nie ciąży po przejściu przez rów i mokre poszycie. Obwód 38-46 cm.",
    highlights: [
      "Zgodna z modułami do 45 mm",
      "Szerokość 4 cm",
      "Rzep na panel ID",
      "Obwód 38-46 cm",
    ],
  },
};
