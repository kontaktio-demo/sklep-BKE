# PYTANIA NA RANO — DogStore (do dopracowania całości)

> Pracowałem autonomicznie w nocy. Poniżej wszystko, co wymaga Twojej decyzji albo prawdziwych
> danych, żeby domknąć projekt. Pogrupowane; przy każdym mój **domyślny wybór** (co przyjąłem,
> żeby wszystko działało „na gotowo") — jeśli pasuje, nic nie robisz. Dane do wklejenia są też
> w `DANE-DO-UZUPELNIENIA.md`.

## A. Katalog produktów (najważniejsze)
1. **Czy 26 obroży cywilnych + 12 służbowych (obecny katalog DogStore) to Twój prawdziwy
   asortyment na start?** Domyślnie: **tak** — zaseedowałem je jako realny katalog (sklep jest
   pełny i działa). Ceny/specyfikacje/stany są jednak **prowizoryczne (wymyślone)** — patrz
   `DANE-DO-UZUPELNIENIA.md`. Jeśli wolisz zacząć od pustego sklepu i dodać produkty w panelu —
   powiedz, wyczyszczę seed jednym skryptem.
2. **Prawdziwe ceny, stany magazynowe, zdjęcia** — do wprowadzenia (panel albo lista).
3. **Warianty**: obroże mają rozmiar (S/M/L) + kolor + szerokość. Zostawić ten model, czy
   dodać coś jeszcze (np. grawer/personalizacja panelu ID)?

## B. Dwa sklepy (DogStore / DogStore Pro)
4. Rozdział produktów po kolumnie `line` (shop/pro) — w panelu wybierasz sklep przy produkcie.
   OK? Czy Pro ma mieć **osobny checkout/koszyk** czy wspólny (domyślnie: wspólny koszyk,
   produkt wie z której linii)?
5. Czy Pro sprzedaje online, czy zostaje przy **zapytaniach ofertowych** (jak teraz)? Domyślnie:
   Pro ma i katalog, i możliwość zakupu — ale mogę zostawić Pro jako „zapytanie", powiedz.

## C. Dane firmowe / prawne (do faktur, regulaminu, polityki)
6. Nazwa firmy, forma prawna, **NIP, REGON, KRS**, adres siedziby, sąd rejestrowy, kapitał.
   (Teraz wartości zastępcze — patrz DANE-DO-UZUPELNIENIA.md.)
7. **Adres punktu odbioru osobistego** (Kotecki miał Bedoń Wieś — usunąłem; podaj swój lub
   wyłączamy odbiór osobisty).
8. Treść **regulaminu, polityki prywatności, zwrotów** — użyć obecnych z DogStore, czy masz
   swoje/prawnika? (Oznaczyłem do weryfikacji prawnej.)

## D. Płatności
9. **Stripe** (jak Kotecki: karta/BLIK/Przelewy24) czy inny operator (Przelewy24/PayU/Autopay)?
   Domyślnie: Stripe. Potrzebne klucze (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
10. Faktury/paragony — automatyczne? Integracja (np. Fakturownia/wFirma)? Kotecki nie miał.

## E. Wysyłka
11. **InPost** (paczkomat 16,99 / kurier 29,99 — kwoty Koteckiego, do potwierdzenia) — Twoje
    stawki? Próg darmowej dostawy (Kotecki 149 zł; DogStore front mówił 299 zł — **ustawiłem 299**).
12. Token InPost + ID punktu nadania (`INPOST_TOKEN`, `INPOST_ORG_ID`). Inni kurierzy?

## F. Mail transakcyjny
13. **Resend** (jak Kotecki) czy inny SMTP? Adres nadawcy (ustawiłem `sklep@dogstore.pl`),
    domena zweryfikowana w Resend? Klucz `RESEND_API_KEY`.

## G. Konta / logowanie
14. Logowanie klienta **magic-link** (bez hasła, jak Kotecki) — zostawić? Czy chcesz też
    hasło/Google? Domyślnie: magic-link.

## H. Panel administracyjny
15. Logowanie do panelu: na start **klucz admina** (jak Kotecki, `ADMIN_API_KEY`) czy od razu
    konto e-mail z rolą admin w Supabase? Domyślnie: klucz + brama, łatwo podmienić na role.
16. Kto ma mieć dostęp do panelu (adresy e-mail administratorów)?
17. Powiadomienia push o nowym zamówieniu (Kotecki „dzwonił") — zostawić? Klucze VAPID generuję.

## I. Analityka / marketing
18. **Meta Pixel + Conversions API** (Kotecki miał) — Twój `FB_PIXEL_ID` + token? Google
    Analytics/Ads? Newsletter — Resend jak teraz czy Mailchimp/inny?
19. Kod powitalny newslettera: ustawiłem **DOG10** (-10%). OK?

## J. Domena / deploy
20. Docelowa domena (zakładam **dogstore.pl**). Deploy: skonsolidowałem do **jednej aplikacji
    Next.js** (Vercel) — bez osobnego Rendera. Potwierdź, że Vercel jest OK (kroki w DEPLOY.md).
21. Projekt Supabase — założysz Ty czy mam przygotować dokładny skrypt (SQL gotowy do wklejenia)?

## K. Funkcje — zakres
22. Kotecki miał: recenzje, kody rabatowe, newsletter, konfigurator zestawów, tryb „sklep
    zamknięty", cookie consent, konta z historią i adresami. **Wszystko odwzorowane.** Czy coś
    dodać ponad Koteckiego (wishlista? porównywarka? subskrypcje? program lojalnościowy?).
23. Konfigurator zestawów Koteckiego (pick/slots) — DogStore nie ma zestawów, zostawiłem
    mechanizm uśpiony. Chcesz zestawy (np. „obroża + smycz + adresówka")? Mogę włączyć.

## L. Treści / copy
24. Teksty stron (o nas, kontakt, dostawa, gwarancja) — obecne DogStore są dobre? Zostawiam,
    chyba że masz zmiany.

---
### Stan na rano
- Wszystko na gałęzi `feat/kotecki-backend-migration` (żywy sklep nietknięty).
- Build/typecheck/lint zielone; bramka „zero Koteckiego" = 0 trafień.
- Szczegóły co zrobione: `PROGRESS.md`. Dane do wklejenia: `DANE-DO-UZUPELNIENIA.md`.
