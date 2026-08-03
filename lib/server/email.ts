import "server-only";
import { SERVER, PUBLIC } from "@/lib/env";

/**
 * Mail transakcyjny przez Resend (REST, bez SDK). Marka DogStore. Gdy brak RESEND_API_KEY,
 * funkcje są ciche (no-op) — sklep działa, mail włączy się po konfiguracji.
 */
const RESEND_URL = "https://api.resend.com/emails";
const zl = (grosze: number) => (grosze / 100).toFixed(2).replace(".", ",") + " zł";

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

function shell(title: string, body: string): string {
  return `<!doctype html><html lang="pl"><body style="margin:0;background:#f0f0ee;font-family:Arial,Helvetica,sans-serif;color:#16161a">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <a href="${PUBLIC.siteUrl}" style="text-decoration:none;display:inline-block;margin-bottom:24px">
      <img src="${PUBLIC.siteUrl}/brand/ds-logo.png" alt="Dog Store" width="150" style="display:block;height:auto;border:0" />
    </a>
    <h1 style="font-size:22px;line-height:1.25;margin:0 0 16px;font-weight:700">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #dcdcd8;margin:28px 0" />
    <p style="font-size:12px;line-height:1.6;color:#63636a">
      Dog Store — sprzęt dla psów pracujących i ich przewodników<br />
      <a href="${PUBLIC.siteUrl}" style="color:#63636a">dogstore.pl</a>
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
}): Promise<void> {
  const rows = params.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.name} × ${i.qty}</td><td style="padding:6px 0;text-align:right">${zl(
          i.price_grosze * i.qty
        )}</td></tr>`
    )
    .join("");
  const body = `
    <p>Dziękujemy za zamówienie <strong>${params.number}</strong>. Przyjęliśmy je do realizacji.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      ${rows}
      <tr><td style="padding:6px 0;border-top:1px solid #dcdcd8">Wysyłka</td><td style="padding:6px 0;border-top:1px solid #dcdcd8;text-align:right">${zl(
        params.shipping_grosze
      )}</td></tr>
      ${params.discount_grosze > 0 ? `<tr><td style="padding:6px 0">Rabat</td><td style="padding:6px 0;text-align:right">-${zl(params.discount_grosze)}</td></tr>` : ""}
      <tr><td style="padding:8px 0;font-weight:700">Razem</td><td style="padding:8px 0;text-align:right;font-weight:700">${zl(
        params.total_grosze
      )}</td></tr>
    </table>
    <p style="font-size:14px"><a href="${PUBLIC.siteUrl}/konto/zamowienia" style="color:#c20812">Podgląd zamówienia</a></p>`;
  await send(params.to, `Zamówienie ${params.number} — Dog Store`, shell("Zamówienie przyjęte", body));
}

export async function sendContactNotify(params: {
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string;
}): Promise<void> {
  const body = `<p><strong>Od:</strong> ${params.name ?? "—"} (${params.email ?? "—"})</p>
    <p><strong>Temat:</strong> ${params.subject ?? "—"}</p>
    <p style="white-space:pre-wrap">${params.message.replace(/</g, "&lt;")}</p>`;
  await send(SERVER.contactNotifyEmail, `Wiadomość ze strony — Dog Store`, shell("Nowa wiadomość", body));
}

export async function sendNewsletterConfirm(to: string, confirmUrl: string): Promise<void> {
  const body = `<p>Potwierdź zapis do newslettera Dog Store i odbierz kod <strong>${SERVER.newsletterWelcomeCode}</strong> (-10%).</p>
    <p><a href="${confirmUrl}" style="display:inline-block;background:#16161a;color:#fff;padding:12px 20px;border-radius:4px;text-decoration:none">Potwierdzam zapis</a></p>`;
  await send(to, "Potwierdź zapis — Dog Store", shell("Jeszcze jeden krok", body));
}
