import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { deletePromotion, updatePromotion } from "@/lib/server/adminData";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await readJson(req);
  return withAdmin(req, () => updatePromotion(id, body).then(() => ({ id })));
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withAdmin(req, () => deletePromotion(id).then(() => ({ id })));
}
