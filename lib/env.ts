/**
 * Jedno miejsce na dostęp do zmiennych środowiskowych + flagi „czy skonfigurowane".
 * Dzięki temu build i dev DZIAŁAJĄ bez żadnych sekretów (storefront wpada na mock),
 * a produkcja włącza realny backend, gdy ENV są ustawione. Wzorzec z Koteckiego:
 * brak konfiguracji != błąd, tylko tryb ograniczony.
 */

// --- publiczne (bezpieczne w przeglądarce) ---
export const PUBLIC = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
};

// --- serwerowe (NIGDY nie eksponować do klienta) ---
export const SERVER = {
  supabaseUrl: process.env.SUPABASE_URL ?? PUBLIC.supabaseUrl,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET ?? "",
  adminApiKey: process.env.ADMIN_API_KEY ?? "",
  stripeSecret: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Dog Store <sklep@dogstore.pl>",
  contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL ?? "kontakt@dogstore.pl",
  newsletterWelcomeCode: process.env.NEWSLETTER_WELCOME_CODE ?? "DOG10",
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? "",
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
  vapidSubject: process.env.VAPID_SUBJECT ?? "mailto:kontakt@dogstore.pl",
  fbPixelId: process.env.FB_PIXEL_ID ?? "",
  fbCapiToken: process.env.FB_CAPI_TOKEN ?? "",
  inpostToken: process.env.INPOST_TOKEN ?? "",
  inpostOrgId: process.env.INPOST_ORG_ID ?? "",
  inpostBaseUrl: process.env.INPOST_BASE_URL ?? "https://api-shipx-pl.easypack24.net/v1",
};

/** Czy sklep ma podpiętą bazę (produkcja). W przeciwnym razie storefront jedzie na mocku. */
export function hasSupabase(): boolean {
  return Boolean(SERVER.supabaseUrl && SERVER.supabaseServiceKey);
}
export function hasSupabasePublic(): boolean {
  return Boolean(PUBLIC.supabaseUrl && PUBLIC.supabaseAnonKey);
}
export function hasStripe(): boolean {
  return Boolean(SERVER.stripeSecret);
}
