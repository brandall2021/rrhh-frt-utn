import { prisma } from "./db";

export interface DailyReportEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  typeCode: string;
  typeColor: string;
  notes?: string;
  source: "licencia" | "inasistencia";
}

export interface DailyReport {
  date: string;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  entries: DailyReportEntry[];
}

export async function getDailyReport(dateStr: string): Promise<DailyReport> {
  const date = new Date(dateStr + "T00:00:00.000Z");

  const [employees, absenceTypes] = await Promise.all([
    prisma.employee.findMany({
      where: { status: "ACTIVO" },
      include: {
        department: { select: { name: true } },
        leaveRequests: {
          where: {
            startDate: { lte: date },
            endDate: { gte: date },
            state: { in: ["APROBADO", "PROCESADO"] },
          },
        },
      },
    }),
    prisma.absenceType.findMany({
      select: { id: true, name: true, code: true, color: true },
    }),
  ]);

  const typeColors = absenceTypes.length > 0
    ? Object.fromEntries(absenceTypes.map((t) => [t.id, { name: t.name, code: t.code, color: t.color }]))
    : {};

  const allAbsences = await prisma.absence.findMany({
    where: { date: { gte: new Date(dateStr + "T00:00:00.000Z"), lte: new Date(dateStr + "T23:59:59.999Z") } },
  });
  const entries: DailyReportEntry[] = [];

  employees.forEach((emp) => {
    const empAbsences = allAbsences.filter((a) => a.employeeId === emp.id);
    const empLeaves = emp.leaveRequests;

    empLeaves.forEach((leave) => {
      entries.push({
        id: leave.id,
        employeeId: emp.id,
        employeeName: `${emp.lastName}, ${emp.firstName}`,
        department: emp.department.name,
        type: leave.type,
        typeCode: leave.type.slice(0, 3),
        typeColor: "red",
        notes: leave.observations ?? undefined,
        source: "licencia",
      });
    });

    empAbsences.forEach((abs) => {
      const tc = typeColors[abs.absenceTypeId];
      entries.push({
        id: abs.id,
        employeeId: emp.id,
        employeeName: `${emp.lastName}, ${emp.firstName}`,
        department: emp.department.name,
        type: tc?.name ?? "Ausencia",
        typeCode: tc?.code ?? "AUS",
        typeColor: tc?.color ?? "red",
        notes: abs.notes ?? undefined,
        source: "inasistencia",
      });
    });
  });

  const seenEmployees = new Set(entries.map((e) => e.employeeId));

  return {
    date: dateStr,
    totalEmployees: employees.length,
    presentCount: employees.length - seenEmployees.size,
    absentCount: seenEmployees.size,
    entries,
  };
}
