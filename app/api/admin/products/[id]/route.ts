import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { deleteProduct, updateProduct } from "@/lib/server/adminData";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await readJson(req);
  return withAdmin(req, () => updateProduct(id, body));
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withAdmin(req, () => deleteProduct(id).then(() => ({ id })));
}
