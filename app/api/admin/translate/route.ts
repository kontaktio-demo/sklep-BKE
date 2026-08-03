import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { translateToEnglish, type TranslatableProduct } from "@/lib/server/translate";

// Auto-tłumaczenie treści produktu PL -> EN dla edytora w panelu (przycisk „Przetłumacz na EN").
export async function POST(req: Request) {
  const body = await readJson<TranslatableProduct>(req);
  return withAdmin(req, () => translateToEnglish(body));
}
