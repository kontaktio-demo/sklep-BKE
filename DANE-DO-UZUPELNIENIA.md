# DANE DO PODMIANY RANO — DogStore

> Ten plik zbiera **wszystko, co wymyśliłem albo zostawiłem jako do uzupełnienia**, żeby
> aplikacja działała w całości bez widocznych placeholderów. Rano podmieniamy na prawdziwe.
> Każda pozycja ma: gdzie w kodzie/ENV, jaka wartość teraz stoi, czym ją zastąpić.
>
> Zasada bezpieczeństwa: nie wpisuję nigdzie realnie wyglądających numerów kont bankowych,
> prawdziwych NIP-ów ani cudzych danych — używam jawnie zastępczych wzorców i loguję je tutaj.

Status: **w budowie** (uzupełniam w trakcie migracji).

---

## 1. Dane firmowe / sprzedawca (prawne)
_(NIP, REGON, KRS, nazwa spółki, adres, sąd rejestrowy, kapitał — do faktur, regulaminu,
polityki prywatności, stopki)_

| Pole | Wartość tymczasowa w kodzie | Podmienić na |
|---|---|---|
| _uzupełniane w trakcie_ | | |

## 2. Kontakt / maile
_(adres e-mail sklepu, e-mail do zamówień, telefon, godziny)_

| Pole | Wartość tymczasowa | Podmienić na |
|---|---|---|

## 3. Płatności
_(dostawca: Przelewy24 / PayU / Stripe — klucze API, ID sprzedawcy, webhook secret)_

| Klucz ENV | Placeholder | Skąd wziąć |
|---|---|---|

## 4. Wysyłka
_(InPost / kurier — token API, ID punktu nadania, progi darmowej dostawy)_

| Klucz ENV | Placeholder | Skąd wziąć |
|---|---|---|

## 5. Mail transakcyjny
_(Resend / SMTP — klucz API, adres nadawcy, domena)_

| Klucz ENV | Placeholder | Skąd wziąć |
|---|---|---|

## 6. Supabase / Render
_(URL projektu, anon key, service role, connection string, sekrety Render)_

| Klucz ENV | Placeholder | Skąd wziąć |
|---|---|---|

## 7. Analityka / tracking
_(Meta Pixel ID, GA4, cokolwiek co Kotecki miał w meta_tracking)_

| Pole | Placeholder | Podmienić na |
|---|---|---|

## 8. Treści prawne
_(regulamin, polityka prywatności, zwroty — jeśli generowane, oznaczyć do weryfikacji prawnej)_

| Dokument | Stan | Uwaga |
|---|---|---|
