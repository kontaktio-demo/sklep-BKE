import { withAdmin } from "@/lib/server/adminRoute";
import { deleteSubscriber } from "@/lib/server/adminData";
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withAdmin(req, () => deleteSubscriber(id).then(() => ({ id })));
}
