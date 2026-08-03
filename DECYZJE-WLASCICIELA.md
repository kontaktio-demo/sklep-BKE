# DECYZJE WŁAŚCICIELA (sesja poranna) — do wdrożenia

## Runda 1
1. **Katalog: START OD PUSTEGO.** Wyczyścić seed produktów; właściciel dodaje produkty
   w panelu → panel MUSI mieć pełną edycję: warianty (rozmiar/cena/stan), kolory, zdjęcia
   (upload do Storage), kategorie, zestawy.
2. **Dog Store Pro: SPRZEDAJE ONLINE** — wspólny koszyk, rozróżnienie po `line`. (jak zbudowane)
3. **Płatności: STRIPE** (karta/BLIK/Przelewy24). (jak zbudowane)
4. **Zakres: WSZYSTKO — pełny parytet z Koteckim + więcej.** W szczególności:
   - **ZESTAWY (konfigurator) dokładnie jak Kotecki** (`bundle_config` pick/slots + UI
     BundleConfigurator na PDP + `order_items.config` + walidacja serwerowa).
   - **WYSYŁKA PACZEK dokładnie jak Kotecki** — InPost ShipX: tworzenie przesyłek z panelu,
     etykiety PDF, wiele paczek, gabaryty, paczkomat/kurier C2C.
   - Wszystkie pozostałe funkcje Koteckiego dopięte (panel: kategorie/klienci/recenzje/
     etykiety; formularze kontakt/newsletter pod API; recenzje na PDP; tryb „sklep zamknięty";
     cookie consent + Meta Pixel).

## Runda 2
5. **Logowanie: magic-link (bez hasła).** (jak zbudowane)
6. **Panel: ADMIN_API_KEY.** (jak zbudowane)
7. **Dostawa: JAK W KOTECKIM** — Paczkomat 16,99 / Kurier 29,99; darmowa od 149 zł.
   → zmienić pricing.ts (locker 1699, courier 2999), settings.free_shipping_grosze=14900,
   metody dostawy dopasować do Koteckiego (paczkomat + kurier InPost, + odbiór osobisty),
   usunąć „za pobraniem"/UE jeśli mają być dokładnie jak Kotecki (prepaid).
8. **Newsletter: DOG10 (-10%).** (jak zbudowane)

## Runda 3
9.  **Domena: dogstore.pl na Vercel** (jedna aplikacja).
10. **Bez odbioru osobistego** → metody dostawy: tylko Paczkomat + Kurier InPost (prepaid).
11. **Meta Pixel + CAPI (jak Kotecki)** — włączyć piksel przeglądarkowy (CAPI już serwerowo).
    **Google Analytics (GA4)** — dodać. **Bez automatycznych faktur.**

## Wygenerowane automatycznie (w .env.local, poza repo)
- ADMIN_API_KEY (32 bajty hex) — gotowy.
- Klucze VAPID (public/private) — gotowe.

## DO ZBUDOWANIA po tej sesji (wg decyzji)
- [ ] Pusty katalog: seed bez produktów (opcja) + PEŁNY edytor produktu w panelu
      (warianty rozmiar/cena/stan, kolory, ZDJĘCIA→Storage, kategorie, ZESTAWY).
- [ ] Zestawy jak Kotecki: bundle_config (pick/slots) + BundleConfigurator na PDP + walidacja.
- [ ] Wysyłka jak Kotecki: InPost ShipX — tworzenie przesyłek z panelu, etykiety PDF, multi-paczka.
- [ ] Dostawa: stawki Kotecki (16,99/29,99), darmowa od 149; metody paczkomat+kurier.
- [ ] Wpiąć formularze kontakt + newsletter pod API; recenzje na PDP (formularz + JSON-LD).
- [ ] Panel: widoki kategorie/klienci/recenzje; tryb „sklep zamknięty" (middleware→wkrótce).
- [ ] Meta Pixel (przeglądarka) + GA4 + cookie consent.
