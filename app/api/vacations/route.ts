import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getVacations, upsertVacation, getVacationsSummary } from "@/lib/vacations";
import { vacationCreateSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-error";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const employeeId = searchParams.get("employeeId") ?? undefined;
  const summary = searchParams.get("summary") === "true";

  if (summary) {
    const data = await getVacationsSummary(year);
    return apiSuccess(data);
  }

  const data = await getVacations({ year, employeeId });
  return apiSuccess(data);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  let body: unknown;
  try { body = await request.json(); }
  catch { return apiError("JSON inválido", 400); }

  const parsed = vacationCreateSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    const result = await upsertVacation(parsed.data);
    return apiSuccess(result, 201);
  } catch (err) {
    console.error("Error upserting vacation:", err);
    return apiError("Error al guardar vacaciones", 500);
  }
}
