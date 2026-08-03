import { withAdmin } from "@/lib/server/adminRoute";
import { deleteMessage } from "@/lib/server/adminData";
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withAdmin(req, () => deleteMessage(id).then(() => ({ id })));
}
