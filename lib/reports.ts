import { prisma } from "./db";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ABSENCES_FILE = path.join(DATA_DIR, "absences.json");

interface AbsenceRecord {
  id: string;
  employeeId: string;
  absenceTypeId: string;
  date: string;
  notes?: string;
}

interface AbsenceTypeInfo {
  id: string;
  name: string;
  code: string;
  color: string;
}

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

function readAbsences(): Record<string, AbsenceRecord[]> {
  try {
    if (fs.existsSync(ABSENCES_FILE)) {
      return JSON.parse(fs.readFileSync(ABSENCES_FILE, "utf-8"));
    }
  } catch {}
  return {};
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
    prisma.$queryRawUnsafe<AbsenceTypeInfo[]>(
      `SELECT id, name, code, color FROM "AbsenceType"`
    ).catch(() => [] as AbsenceTypeInfo[]),
  ]);

  const typeColors = absenceTypes.length > 0
    ? Object.fromEntries(absenceTypes.map((t) => [t.id, { name: t.name, code: t.code, color: t.color }]))
    : {};

  const allAbsences = readAbsences();
  const entries: DailyReportEntry[] = [];

  employees.forEach((emp) => {
    const empAbsences = (allAbsences[emp.id] || []).filter((a) => a.date === dateStr);
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
        notes: abs.notes,
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
