# Redesign „FIELD MANUAL" — kierunek awwwards dla Dog Store

Data: 2026-07-15 · Gałąź: `redesign/awwwards` · Status: zatwierdzony tryb autonomiczny
(właściciel: „podejmuj sam decyzje i kontynuuj samemu, liczy się efekt końcowy")

## Duża idea

Napięcie, którego AI nie generuje samo z siebie: **premium editorialowy serif mówiący
o błocie, obciążeniu i psach roboczych**. Sklep cywilny czyta się jak pięknie złożony
katalog terenowy (papier, serif, mono-parametry), a sekcja Pro zostaje przemysłowym
bilbordem (grafit, Archivo 900, sygnałowa czerwień). Kontrast tych dwóch światów —
i fizyczne przejście między nimi — to sygnaturowy moment całego serwisu.

Wzorce (SOTD 7.3+): Polène (serif-forward restraint), Bécane Paris (2 kolory + motion,
Next.js), SPYLT (scroll-storytelling, tła robią robotę zamiast zdjęć).

## Twarde zasady (anty-AI-slop — słowa właściciela)

ZAKAZANE: równe siatki kart „z linijki", Inter/Geist jako głos marki, marquee,
custom cursor, glassmorphism, gradient-overload, wszystko-wycentrowane, symetryczne
bento, numerki sekcji w rządku jako dekoracja.

WYMAGANE: asymetria i łamanie siatki, typografia z charakterem, rytm i przełamanie,
motion który niesie treść. Checkout i ścieżka zakupu zostają twarde i konwencjonalne —
wow buduje pragnienie na warstwie prezentacji, kupowanie ma być nudne i pewne.

## Typografia (największa pojedyncza zmiana)

| Rola | Było | Będzie |
|---|---|---|
| Display cywilny | Fjalla One (kondensowany) | **Fraunces** (variable serif, osie SOFT/WONK/opsz) |
| Tekst cywilny | Inter | **General Sans** (Fontshare, ITF-FFL) — fallback: Schibsted Grotesk |
| Mono (SKU, parametry) | JetBrains Mono | JetBrains Mono (zostaje — jeden mono na cały serwis) |
| Display Pro | Archivo 800/900 | Archivo 800/900 (zostaje — jest mocne) |
| Tekst Pro | Geist Sans | General Sans (spójny korpus, Geist odchodzi jako AI-tell) |
| Mono Pro | Geist Mono | JetBrains Mono (konsolidacja) |

Skala wraca do hierarchii: hero home `clamp(3rem → 8.5rem)` Fraunces; `type-h2`
rośnie z 20px do `clamp(1.75rem, 3.4vw, 2.75rem)`. PLP/PDP dostają serif w nagłówkach,
ale zachowują sklepową dyscyplinę (ceny, CTA, filtry bez zmian koncepcyjnych).

## Kolor i materiał (paleta ZOSTAJE — dochodzi głębia)

1. **Grain**: statyczny szum (SVG feTurbulence wypalony do data-URI) jako nakładka
   per świat — papier `multiply` ~4-5%, grafit `screen` ~6-7%. Zero JS, zero żywych filtrów.
2. **Drabina papieru**: #f0f0ee → #e5e5e2 → nowy stopień #dcdcd8 („zatopione" sekcje);
   biel karty zawsze najwyżej. Jedna temperatura.
3. **Blackout**: jeden twardy, pełnoekranowy cut grafitu na home (manifest marki) —
   rytm papier(długi) → grafit(krótki) → papier. Krawędź = linia, bez gradientów.
4. **Czerwień 90/9/1**: jeden czerwony obiekt na widok. Na cywilu CTA są tuszowe,
   czerwień tylko stan/akcent/jedno słowo.
5. Pro: near-blacks ocieplone czerwienią przez `color-mix(oklab, #161616 94%, red)`
   wyłącznie w warstwach surface/raised.

## Layout — asymetria zamiast stosu

- **Hero home**: full-bleed zdjęcie (stock do czasu sesji), tekst zakotwiczony
  lewo-dół (jak ProHero), Fraunces display + mono-metka; bez centrowania.
- **„Wybierz sklep"**: koniec równych kafli 50/50 — podział ~62/38 z typograficznym
  nadwieszeniem; kafel Pro ciemny (zapowiedź drugiego świata).
- **Bestsellery**: editorialowy rząd z przesunięciem (pierwsza karta większa,
  linia bazowa łamana), nie równy grid.
- **Manifest (blackout)**: wielki serif na graficie, 2-3 zdania o robocie; jedyne
  miejsce dużej skali na ciemnym tle cywilnej trasy.
- **„Jak pracujemy"**: trzy punkty jako sekwencja pinned/stacking cards (GSAP scrub).

## Zdjęcia (stock TERAZ, sesja fotografki PÓŹNIEJ)

Właściciel zgodził się na stock (Pexels/Unsplash, licencje komercyjne bez atrybucji)
do czasu dostawy własnych. Sloty w `public/foto/` (system `photo()` już to podnosi):
`hero.jpg`, `sklep.jpg`, `pro.jpg`, `robocze.jpg`, `codzienne.jpg`, `e-obroza.jpg`,
`pro-{patrol,handle,e-collar,training,detection}.jpg`. Dyrekcja: psy robocze
(owczarek/malinois), naturalne światło, ziemiste tony na cywil; ciemne, kontrastowe,
skupione kadry na Pro. ŻADNYCH pastelowych „cute" stocków. Packshoty produktów
zostają na SVG do sesji — stock nie udaje produktu.

## Motion (GSAP + Lenis „w porządny sposób")

Poprzednia guma wzięła się z lerpowania scrolla w rAF na main-thread przy ciężkich
klatkach. Zasady nowego stosu:
- `lenis/react` (root) zsynchronizowany z tickerem GSAP, `lagSmoothing(0)`;
  Lenis NIE montuje się przy `prefers-reduced-motion`.
- Animujemy WYŁĄCZNIE transform/opacity/clip-path. Zero animacji layoutu.
- Reveals przez clip-path/maskę (redakcyjne odsłonięcie), raz (`once: true`).
- Pinned hero ze scrubem na home; przejścia koloru tła między sekcjami.
- View Transitions PLP→PDP: `view-transition-name` tylko na klikanej karcie
  (nadawany w onClick), morfujący kadr+tytuł; degradacja = zwykła nawigacja.
- Budżety: LCP < 2.5s, INP < 200ms; hero z `priority`, WebGL — nie teraz.

## Poza zakresem (czeka na sesję zdjęciową)

Displacement/WebGL na packshotach, 360° spin, hover-to-video, lookbook, dwupoziomowy
zoom PLP, generacje Higgsfield.

## Kryterium sukcesu

Strona przechodzi „test dwóch sekund" jurora: typografia z charakterem + jeden mocny
moment scrollowy + spójny materiał (grain/rytm/asymetria), przy zielonym build,
działającym zakupie i braku gumy w scrollu. Realny próg zgłoszenia do Awwwards.
