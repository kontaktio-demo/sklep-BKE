import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { listProducts, saveProductFull } from "@/lib/server/adminData";

export async function GET(req: Request) {
  const sklep = new URL(req.url).searchParams.get("sklep");
  const line = sklep === "pro" || sklep === "shop" ? sklep : undefined;
  return withAdmin(req, () => listProducts(line));
}

// Utworzenie produktu (pełne: pola + warianty + kolory).
export async function POST(req: Request) {
  const body = await readJson(req);
  return withAdmin(req, () => saveProductFull(null, body));
}
