# MIGRATION_NOTES — otwarte kwestie i TODO

Stan: migracja funkcjonalna Kotecki → DogStore wykonana jako **jedna aplikacja Next.js +
jedna baza Supabase**, parytet funkcji, styl DogStore, rozdział DogStore / DogStore Pro,
zero śladów po Koteckim (bramka grep = 0). Poniżej co zostało do dopracowania rano —
pełne pytania w `PYTANIA-NA-RANO.md`, dane do wklejenia w `DANE-DO-UZUPELNIENIA.md`.

## Zrobione (parytet z Koteckim)
- Baza (schema.sql) + seed z żywego katalogu (26 shop + 12 pro, warianty/kolory/zdjęcia).
- Katalog czytany z bazy przez SEAM (fallback mock). Dwa sklepy przez kolumnę `line`.
- Koszyk → kasa (4 metody dostawy, kod rabatowy, wycena serwerowa) → Stripe (PaymentElement) →
  webhook (idempotencja, markPaid/release/refund) → mail (Resend) → push → Meta CAPI.
- Zamówienia: transakcyjny `create_order` (rezerwacja stanu wariantu), statusy, numery DS-/DSP-.
- Konto (magic-link): profil, zamówienia, adresy (API + strony /konto, /logowanie).
- Recenzje (weryfikowane tokenem zamówienia), newsletter (double opt-in), kontakt.
- Panel /panel (styl DogStore, płaskie tło): pulpit, zamówienia, produkty (DogStore/Pro),
  promocje, ustawienia, push. Chroniony `ADMIN_API_KEY` (dev bez klucza = tryb demo).
- PWA panelu (manifest + service worker + subskrypcja push).
- ENV/`.env.example`, `DEPLOY.md`. Wszystko działa bez konfiguracji na mocku.

## Do uzupełnienia danymi (rano) — patrz DANE-DO-UZUPELNIENIA.md
- [ ] Dane firmowe/prawne (NIP, REGON, adres, sąd, kapitał) — do faktur/regulaminu/stopki.
- [ ] Realne ceny, stany magazynowe, zdjęcia produktów (obecnie prowizoryczne z katalogu).
- [ ] Klucze: Supabase, Stripe, InPost, Resend, VAPID, Meta, ADMIN_API_KEY.
- [ ] Adres punktu odbioru osobistego (jeśli włączamy odbiór; obecnie brak metody „pickup").

## Do dopracowania (funkcje/UI — API gotowe)
- [ ] Panel: edycja WARIANTÓW produktu (rozmiar/cena/stan) i zdjęć (upload do Storage).
      Obecnie panel edytuje cenę „od"/aktywność/model; warianty są w seedzie i przez SQL.
- [ ] Panel: kategorie CRUD w UI (API `admin/categories` gotowe), klienci, recenzje (moderacja
      — API `admin/*` częściowo; dołożyć widoki).
- [ ] Kasa: geowidget InPost do wyboru paczkomatu (obecnie pole na kod paczkomatu).
- [ ] InPost: generowanie etykiet z panelu (endpoint + integracja ShipX) — do dopięcia.
- [ ] Recenzje: widok/formularz na karcie produktu (API `reviews` gotowe) + JSON-LD aggregateRating.
- [ ] Newsletter: podpięcie istniejącego komponentu `Newsletter` pod `POST /api/newsletter`
      (dziś komponent to zapis mailem; API double opt-in gotowe).
- [ ] Kontakt: podpięcie `ContactForm` pod `POST /api/contact` (API gotowe).
- [ ] Konto: strony „Adresy" i „Dane" (edycja) — API gotowe (`account/addresses`, `account/me`).
- [ ] Tryb „sklep zamknięty": middleware → strona „wkrótce" (ustawienie `open` w panelu istnieje).
- [ ] Cookie consent + Meta Pixel (przeglądarkowy) — CAPI serwerowy gotowy.

## Decyzje architektoniczne (do potwierdzenia)
- Jedna aplikacja (Vercel) zamiast trójki Kotecki (Next + Render + Vite). Potwierdź kierunek.
- Pro: wspólny checkout/koszyk z rozróżnieniem `line`. Czy Pro sprzedaje online, czy zostaje
  przy zapytaniach ofertowych? (Domyślnie: sprzedaje.)
- Logowanie: magic-link (bez hasła). Dostęp do panelu: `ADMIN_API_KEY` (opcja: role Supabase).

## Bezpieczeństwo
- `ADMIN_API_KEY` MUSI być ustawiony na produkcji (bez niego panel jest zablokowany w prod;
  w dev bez klucza działa tryb demo tylko do podglądu).
- Sekrety wyłącznie w ENV. RLS włączone; zapisy przez service_role (serwer).
