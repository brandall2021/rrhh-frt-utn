import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAuditLogs, getAuditLogsTotal } from "@/lib/audit";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "200", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const data = await getAuditLogs(limit, offset);
  const total = await getAuditLogsTotal();

  return Response.json({ data, total });
}
