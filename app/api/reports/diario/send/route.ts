import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDailyReport } from "@/lib/reports";
import { sendDailyReportEmail } from "@/lib/mail";
import { emailSendSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-error";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  let body: unknown;
  try { body = await request.json(); }
  catch { return apiError("JSON inválido", 400); }

  const parsed = emailSendSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const date = parsed.data.date || new Date().toISOString().slice(0, 10);

  try {
    const report = await getDailyReport(date);
    const sent = await sendDailyReportEmail(parsed.data.to, report);
    if (!sent) return apiError("Error al enviar el email", 500);

    return apiSuccess({ sent: true, to: parsed.data.to, date });
  } catch (err) {
    console.error("Error sending daily report:", err);
    return apiError("Error al enviar reporte diario", 500);
  }
}
