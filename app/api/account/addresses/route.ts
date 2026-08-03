import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/server/customerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { AddressBody } from "@/lib/server/addressSchema";

const un = () => NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

export async function GET(req: Request) {
  const c = await getCustomerFromRequest(req);
  if (!c) return un();
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: true, addresses: [] });
  const { data } = await db.from("account_addresses").select("*").eq("user_id", c.userId).order("is_default", { ascending: false });
  return NextResponse.json({ ok: true, addresses: data ?? [] });
}

export async function POST(req: Request) {
  const c = await getCustomerFromRequest(req);
  if (!c) return un();
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });
  const parsed = AddressBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  const { data, error } = await db
    .from("account_addresses")
    .insert({ ...parsed.data, user_id: c.userId })
    .select("id")
    .single();
  if (error) return NextResponse.json({ ok: false, error: "SAVE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
