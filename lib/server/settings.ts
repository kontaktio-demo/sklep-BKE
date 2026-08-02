import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { DEFAULT_FREE_SHIPPING_GROSZE } from "./pricing";

export interface StoreSettings {
  free_shipping_grosze: number;
  currency: string;
  open: boolean;
  open_date?: string | null;
}

const DEFAULTS: StoreSettings = {
  free_shipping_grosze: DEFAULT_FREE_SHIPPING_GROSZE,
  currency: "PLN",
  open: true,
  open_date: null,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const db = supabaseAdmin();
  if (!db) return DEFAULTS;
  const { data, error } = await db.from("settings").select("value").eq("key", "store").maybeSingle();
  if (error || !data) return DEFAULTS;
  return { ...DEFAULTS, ...(data.value as Partial<StoreSettings>) };
}
