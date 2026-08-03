import { withAdmin } from "@/lib/server/adminRoute";
import { stats } from "@/lib/server/adminData";

export async function GET(req: Request) {
  return withAdmin(req, () => stats());
}
