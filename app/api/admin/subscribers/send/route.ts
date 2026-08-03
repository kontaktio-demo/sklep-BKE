import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { sendCampaign } from "@/lib/server/adminData";

// Wysyłka kampanii newsletterowej do potwierdzonych subskrybentów (panel: Newsletter).
export async function POST(req: Request) {
  const body = await readJson<{ subject?: string; body?: string }>(req);
  return withAdmin(req, () => sendCampaign(body.subject ?? "", body.body ?? ""));
}
