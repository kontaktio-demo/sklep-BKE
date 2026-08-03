import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendWelcomeCode } from "@/lib/server/email";
import { PUBLIC } from "@/lib/env";
import { isLocale } from "@/i18n/config";

// Potwierdzenie double opt-in (link z maila): confirmed=true + mail z kodem powitalnym (-10%)
// w języku zapisu. Redirect wraca na stronę główną w tym samym języku.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const db = supabaseAdmin();
  let locale: "pl" | "en" = "pl";

  if (token && db) {
    const { data: sub } = await db
      .from("newsletter_subscribers")
      .select("id,email,locale,confirmed")
      .eq("confirm_token", token)
      .maybeSingle();
    if (sub) {
      if (isLocale(sub.locale)) locale = sub.locale;
      await db
        .from("newsletter_subscribers")
        .update({ confirmed: true, confirm_token: null })
        .eq("id", sub.id as string);
      // kod powitalny tylko przy pierwszym potwierdzeniu
      if (!sub.confirmed && sub.email) await sendWelcomeCode(sub.email as string, locale);
    }
  }

  const prefix = locale === "en" ? "/en" : "";
  return NextResponse.redirect(`${PUBLIC.siteUrl}${prefix}/?newsletter=ok`);
}
