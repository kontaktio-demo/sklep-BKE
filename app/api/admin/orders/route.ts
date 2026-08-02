import { withAdmin } from "@/lib/server/adminRoute";
import { listOrders } from "@/lib/server/adminData";

export async function GET(req: Request) {
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  return withAdmin(req, () => listOrders(status || undefined));
}
