import { withAdmin } from "@/lib/server/adminRoute";
import { statsMonthly } from "@/lib/server/adminData";

export async function GET(req: Request) {
  return withAdmin(req, () => statsMonthly());
}
