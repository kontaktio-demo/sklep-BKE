import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { deleteProduct, getProductFull, saveProductFull } from "@/lib/server/adminData";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withAdmin(req, () => getProductFull(id));
}

// Zapis produktu (pola + warianty). Dla drobnych zmian (np. active) przychodzi sam patch pól.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await readJson(req);
  return withAdmin(req, () => saveProductFull(id, body));
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withAdmin(req, () => deleteProduct(id).then(() => ({ id })));
}
