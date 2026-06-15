import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDailyReport } from "@/lib/reports";
import { sendDailyReportEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { date?: string; to?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const date = body.date || new Date().toISOString().slice(0, 10);
  const to = body.to;

  if (!to) {
    return Response.json({ error: "El destinatario (to) es requerido" }, { status: 400 });
  }

  try {
    const report = await getDailyReport(date);
    const sent = await sendDailyReportEmail(to, report);
    if (!sent) {
      return Response.json({ error: "Error al enviar el email" }, { status: 500 });
    }
    return Response.json({ data: { sent: true, to, date } });
  } catch (err) {
    console.error("Error sending daily report:", err);
    return Response.json({ error: "Error al enviar reporte diario" }, { status: 500 });
  }
}
