import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { absenceTypeArraySchema } from "@/lib/validation";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-error";

const DEFAULT_TYPES = [
  { name: "Enfermedad", code: "ENF", color: "red" },
  { name: "Particular", code: "PAR", color: "amber" },
  { name: "Estudio", code: "EST", color: "blue" },
  { name: "Compensatorio", code: "COM", color: "emerald" },
  { name: "Licencia Médica", code: "MED", color: "orange" },
  { name: "Maternidad", code: "MAT", color: "purple" },
  { name: "Ausencia", code: "AUS", color: "slate" },
];

async function ensureDefaultTypes(): Promise<void> {
  const count = await prisma.absenceType.count();
  if (count > 0) return;

  await prisma.absenceType.createMany({
    data: DEFAULT_TYPES.map((t) => ({
      name: t.name,
      code: t.code,
      color: t.color,
    })),
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  await ensureDefaultTypes();
  const types = await prisma.absenceType.findMany({ orderBy: { name: "asc" } });
  return apiSuccess(types);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  let body: unknown;
  try { body = await request.json(); }
  catch { return apiError("JSON inválido", 400); }

  const parsed = absenceTypeArraySchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    const saved = await prisma.$transaction(async (tx) => {
      await tx.absenceType.deleteMany();
      await tx.absenceType.createMany({ data: parsed.data });
      return tx.absenceType.findMany({ orderBy: { name: "asc" } });
    });

    return apiSuccess(saved);
  } catch {
    return apiError("Error al guardar tipos de ausencia", 500);
  }
}
