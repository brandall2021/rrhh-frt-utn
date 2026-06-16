import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, getClientIp, diffAbsences } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const absences = await prisma.absence.findMany({
    where: { employeeId: params.id },
    orderBy: { date: "asc" },
  });

  return Response.json({
    data: absences.map((a) => ({
      ...a,
      date: a.date.toISOString().slice(0, 10),
    })),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { absences?: any[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const oldRecords = await prisma.absence.findMany({
    where: { employeeId: params.id },
    select: { id: true, absenceTypeId: true, date: true, notes: true },
  });
  const oldList = oldRecords.map((a) => ({
    ...a,
    date: a.date.toISOString().slice(0, 10),
  }));
  const newList = body.absences ?? [];

  const ip = getClientIp(request);
  const adminEmail = session.user?.email ?? "desconocido";
  const adminName = (session.user as any)?.name ?? undefined;

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    select: { firstName: true, lastName: true },
  });
  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : params.id;

  const { added, removed } = diffAbsences(oldList, newList, params.id, employeeName);

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
    const formatted = newList.map((a: any) => ({
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

  return Response.json({
    data: saved.map((a) => ({
      ...a,
      date: a.date.toISOString().slice(0, 10),
    })),
  });
}
