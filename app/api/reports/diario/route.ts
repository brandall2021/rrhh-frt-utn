import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDailyReport } from "@/lib/reports";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

  try {
    const report = await getDailyReport(date);
    return Response.json({ data: report });
  } catch (err) {
    console.error("Error generating daily report:", err);
    return Response.json({ error: "Error al generar reporte diario" }, { status: 500 });
  }
}
