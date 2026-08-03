import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { evaluatePromo, type PromoRow } from "@/lib/server/pricing";
import { checkRate } from "@/lib/server/rateLimit";

const Body = z.object({
  code: z.string().trim().min(1).max(64),
  subtotal_grosze: z.number().int().nonnegative(),
});

const MESSAGES: Record<string, string> = {
  // Generyczny komunikat dla nieistniejącego kodu — nie zdradza, czy kod istnieje (anty-enumeracja).
  NOT_FOUND: "Nieprawidłowy kod rabatowy.",
  INACTIVE: "Ten kod jest nieaktywny.",
  NOT_STARTED: "Ten kod jeszcze nie obowiązuje.",
  EXPIRED: "Ten kod wygasł.",
  MIN_ORDER: "Koszyk nie osiąga minimalnej kwoty dla tego kodu.",
  EXHAUSTED: "Limit użyć tego kodu został wyczerpany.",
};

export async function POST(req: Request) {
  const limited = checkRate(req, "promo", 15, 60); // maks. 15 prób / min / IP (anty-brute-force kodów)
  if (limited) return limited;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NOT_FOUND", message: MESSAGES.NOT_FOUND });

  const { data } = await db
    .from("promotions")
    .select("id,code,kind,value,min_order_grosze,active,starts_at,ends_at,usage_limit,used_count")
    .eq("code", parsed.data.code.toUpperCase())
    .maybeSingle();

  const result = evaluatePromo((data as PromoRow) ?? null, parsed.data.subtotal_grosze);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, message: MESSAGES[result.error] });
  }
  return NextResponse.json({
    ok: true,
    code: (data as PromoRow).code,
    discountGrosze: result.discountGrosze,
  });
}
