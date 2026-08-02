import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/server/settings";

// Publiczne ustawienia sklepu (próg darmowej dostawy, czy otwarty). Używa m.in. middleware.
export async function GET() {
  const s = await getStoreSettings();
  return NextResponse.json(
    { freeShippingGrosze: s.free_shipping_grosze, currency: s.currency, open: s.open, openDate: s.open_date ?? null },
    { headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=120" } }
  );
}
