import "server-only";
import { getTranslations } from "next-intl/server";
import { SERVER, PUBLIC } from "@/lib/env";
import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";

/**
 * Mail transakcyjny przez Resend (REST, bez SDK). Marka DogStore. Gdy brak RESEND_API_KEY,
 * funkcje są ciche (no-op) — sklep działa, mail włączy się po konfiguracji.
 *
 * Dwujęzyczność: maile do KLIENTA (potwierdzenie zamówienia, newsletter, kod powitalny,
 * prośba o opinię) idą w języku, który klient wybrał na stronie (kolumna `locale` na
 * zamówieniu/subskrypcji). Powiadomienie kontaktowe trafia do WŁAŚCICIELA i zostaje po polsku.
 */
const RESEND_URL = "https://api.resend.com/emails";
const zl = (grosze: number) => (grosze / 100).toFixed(2).replace(".", ",") + " zł";

// Escapowanie danych użytkownika wstawianych do HTML maila (ochrona przed HTML/JS injection).
function esc(v: string | null | undefined): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Tłumaczenia maili w danym języku (namespace "emails"). Locale spoza pl/en spada na domyślny.
function emailT(locale: Locale) {
  return getTranslations({ locale, namespace: "emails" });
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!SERVER.resendApiKey) return;
  try {
    await fetch(RESEND_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${SERVER.resendApiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: SERVER.emailFrom, to, subject, html }),
    });
  } catch {
    // brak łączności — nie blokuj procesu zamówienia
  }
}

async function shell(locale: Locale, title: string, body: string): Promise<string> {
  const t = await emailT(locale);
  return `<!doctype html><html lang="${locale}"><body style="margin:0;background:#f0f0ee;font-family:Arial,Helvetica,sans-serif;color:#16161a">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <a href="${PUBLIC.siteUrl}" style="text-decoration:none;display:inline-block;margin-bottom:24px">
      <img src="${PUBLIC.siteUrl}/brand/ds-logo.png" alt="Dog Store" width="150" style="display:block;height:auto;border:0" />
    </a>
    <h1 style="font-size:22px;line-height:1.25;margin:0 0 16px;font-weight:700">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #dcdcd8;margin:28px 0" />
    <p style="font-size:12px;line-height:1.6;color:#63636a">
      ${esc(t("shell.footer"))}<br />
      <a href="${PUBLIC.siteUrl}" style="color:#63636a">${esc(t("shell.link"))}</a>
    </p>
  </div></body></html>`;
}

export interface OrderEmailItem {
  name: string;
  qty: number;
  price_grosze: number;
}

export async function sendOrderConfirmation(params: {
  to: string;
  number: string;
  items: OrderEmailItem[];
  subtotal_grosze: number;
  shipping_grosze: number;
  discount_grosze: number;
  total_grosze: number;
  locale?: Locale;
}): Promise<void> {
  const locale = params.locale ?? defaultLocale;
  const t = await emailT(locale);
  const rows = params.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${esc(i.name)} × ${i.qty}</td><td style="padding:6px 0;text-align:right">${zl(
          i.price_grosze * i.qty
        )}</td></tr>`
    )
    .join("");
  const body = `
    <p>${t("order.intro", { number: esc(params.number) })}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      ${rows}
      <tr><td style="padding:6px 0;border-top:1px solid #dcdcd8">${esc(t("order.shipping"))}</td><td style="padding:6px 0;border-top:1px solid #dcdcd8;text-align:right">${zl(
        params.shipping_grosze
      )}</td></tr>
      ${params.discount_grosze > 0 ? `<tr><td style="padding:6px 0">${esc(t("order.discount"))}</td><td style="padding:6px 0;text-align:right">-${zl(params.discount_grosze)}</td></tr>` : ""}
      <tr><td style="padding:8px 0;font-weight:700">${esc(t("order.total"))}</td><td style="padding:8px 0;text-align:right;font-weight:700">${zl(
        params.total_grosze
      )}</td></tr>
    </table>
    <p style="font-size:14px"><a href="${PUBLIC.siteUrl}/konto/zamowienia" style="color:#c20812">${esc(t("order.view"))}</a></p>`;
  await send(params.to, t("order.subject", { number: params.number }), await shell(locale, esc(t("order.heading")), body));
}

// Powiadomienie do WŁAŚCICIELA (skrzynka sklepu) — zawsze po polsku.
export async function sendContactNotify(params: {
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string;
}): Promise<void> {
  const body = `<p><strong>Od:</strong> ${esc(params.name) || "—"} (${esc(params.email) || "—"})</p>
    <p><strong>Temat:</strong> ${esc(params.subject) || "—"}</p>
    <p style="white-space:pre-wrap">${esc(params.message)}</p>`;
  await send(SERVER.contactNotifyEmail, "Wiadomość ze strony — Dog Store", await shell(defaultLocale, "Nowa wiadomość", body));
}

export async function sendNewsletterConfirm(to: string, confirmUrl: string, locale: Locale = defaultLocale): Promise<void> {
  const t = await emailT(locale);
  const body = `<p>${t("newsletter.body", { code: esc(SERVER.newsletterWelcomeCode) })}</p>
    <p><a href="${confirmUrl}" style="display:inline-block;background:#16161a;color:#fff;padding:12px 20px;border-radius:4px;text-decoration:none">${esc(t("newsletter.cta"))}</a></p>`;
  await send(to, t("newsletter.subject"), await shell(locale, esc(t("newsletter.heading")), body));
}

// Kod powitalny po potwierdzeniu zapisu (double opt-in) — realizuje obietnicę -10%.
export async function sendWelcomeCode(to: string, locale: Locale = defaultLocale): Promise<void> {
  const t = await emailT(locale);
  const body = `<p>${t("welcome.body", { code: esc(SERVER.newsletterWelcomeCode) })}</p>
    <p><a href="${PUBLIC.siteUrl}/collections/collars" style="display:inline-block;background:#c20812;color:#fff;padding:12px 20px;border-radius:4px;text-decoration:none">${esc(t("welcome.cta"))}</a></p>`;
  await send(to, t("welcome.subject", { code: SERVER.newsletterWelcomeCode }), await shell(locale, esc(t("welcome.heading")), body));
}

// Kampania newsletterowa: właściciel pisze temat + treść (zwykły tekst). Każdy odbiorca dostaje
// wiadomość w brandowym szablonie w swoim języku + link wypisu z własnym tokenem.
function nl2br(text: string): string {
  return esc(text).replace(/\n/g, "<br>");
}
export async function sendNewsletterCampaign(
  subject: string,
  bodyText: string,
  recipients: { email: string; unsubToken: string | null; locale?: Locale }[],
): Promise<{ sent: number }> {
  const htmlBody = `<div style="font-size:14px;line-height:1.7">${nl2br(bodyText)}</div>`;
  let sent = 0;
  for (const r of recipients) {
    const locale = r.locale ?? defaultLocale;
    const t = await emailT(locale);
    const unsubUrl = r.unsubToken
      ? `${PUBLIC.siteUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(r.unsubToken)}`
      : PUBLIC.siteUrl;
    const body = `${htmlBody}
      <hr style="border:none;border-top:1px solid #dcdcd8;margin:24px 0" />
      <p style="font-size:12px"><a href="${unsubUrl}" style="color:#63636a">${esc(t("campaign.unsubscribe"))}</a></p>`;
    await send(r.email, subject, await shell(locale, esc(subject), body));
    sent += 1;
  }
  return { sent };
}

// Prośba o opinię po dostarczeniu zamówienia (link z tokenem recenzji).
export async function sendReviewRequest(params: {
  to: string;
  number: string;
  reviewToken: string;
  locale?: Locale;
}): Promise<void> {
  const locale = params.locale ?? defaultLocale;
  const t = await emailT(locale);
  const url = `${PUBLIC.siteUrl}/opinie?t=${encodeURIComponent(params.reviewToken)}`;
  const body = `<p>${t("review.body", { number: esc(params.number) })}</p>
    <p><a href="${url}" style="display:inline-block;background:#16161a;color:#fff;padding:12px 20px;border-radius:4px;text-decoration:none">${esc(t("review.cta"))}</a></p>`;
  await send(params.to, t("review.subject"), await shell(locale, esc(t("review.heading")), body));
}
