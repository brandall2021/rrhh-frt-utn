import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, getClientIp, diffAbsences } from "@/lib/audit";
import { absenceBulkSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-error";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  const absences = await prisma.absence.findMany({
    where: { employeeId: params.id },
    orderBy: { date: "asc" },
  });

  return apiSuccess(absences.map((a) => ({
    ...a,
    date: a.date.toISOString().slice(0, 10),
  })));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  let body: { absences?: unknown };
  try { body = await request.json(); }
  catch { return apiError("JSON inválido", 400); }

  const parsed = absenceBulkSchema.safeParse(body.absences);
  if (!parsed.success) return handleZodError(parsed.error);

  const oldRecords = await prisma.absence.findMany({
    where: { employeeId: params.id },
    select: { id: true, absenceTypeId: true, date: true, notes: true },
  });
  const oldList = oldRecords.map((a) => ({
    ...a,
    date: a.date.toISOString().slice(0, 10),
  }));
  const newList = parsed.data;

  const ip = getClientIp(request);
  const adminEmail = session.user?.email ?? "desconocido";
  const adminName = (session.user as any)?.name ?? undefined;

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    select: { firstName: true, lastName: true },
  });
  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : params.id;

  const newListWithIds = newList.map((a) => ({ ...a, id: a.id || `new_${a.date}` }));
  const { added, removed } = diffAbsences(oldList, newListWithIds, params.id, employeeName);

  for (const entry of [...added, ...removed]) {
    await logAudit({
      ...entry,
      performedBy: adminEmail,
      adminName,
      ipAddress: ip,
    });
  }

  await prisma.absence.deleteMany({ where: { employeeId: params.id } });

  if (newList.length > 0) {
    const formatted = newList.map((a) => ({
      employeeId: params.id,
      absenceTypeId: a.absenceTypeId,
      date: new Date(a.date + "T00:00:00.000Z"),
      notes: a.notes ?? null,
    }));
    await prisma.absence.createMany({ data: formatted });
  }

  const saved = await prisma.absence.findMany({
    where: { employeeId: params.id },
    orderBy: { date: "asc" },
  });

  return apiSuccess(saved.map((a) => ({
    ...a,
    date: a.date.toISOString().slice(0, 10),
  })));
}
