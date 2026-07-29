import { prisma } from "./db";

export async function getVacations(filters?: { year?: number; employeeId?: string }) {
  const records = await prisma.vacation.findMany({
    where: {
      ...(filters?.year && { year: filters.year }),
      ...(filters?.employeeId && { employeeId: filters.employeeId }),
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          department: { select: { name: true } },
        },
      },
    },
    orderBy: [{ year: "desc" }, { employee: { lastName: "asc" } }],
  });

  return records.map((v) => ({
    id: v.id,
    employeeId: v.employeeId,
    employeeName: `${v.employee.firstName} ${v.employee.lastName}`,
    department: v.employee.department.name,
    year: v.year,
    totalDays: v.totalDays,
    usedDays: v.usedDays,
    pendingPrev: v.pendingPrev,
    availableDays: v.totalDays + v.pendingPrev - v.usedDays,
    observations: v.observations ?? undefined,
  }));
}

export async function getVacation(id: string) {
  const v = await prisma.vacation.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          department: { select: { name: true } },
        },
      },
    },
  });
  if (!v) return null;

  return {
    id: v.id,
    employeeId: v.employeeId,
    employeeName: `${v.employee.firstName} ${v.employee.lastName}`,
    department: v.employee.department.name,
    year: v.year,
    totalDays: v.totalDays,
    usedDays: v.usedDays,
    pendingPrev: v.pendingPrev,
    availableDays: v.totalDays + v.pendingPrev - v.usedDays,
    observations: v.observations ?? undefined,
  };
}

export async function upsertVacation(data: {
  employeeId: string;
  year: number;
  totalDays: number;
  usedDays?: number;
  pendingPrev?: number;
  observations?: string;
}) {
  return prisma.vacation.upsert({
    where: {
      employeeId_year: {
        employeeId: data.employeeId,
        year: data.year,
      },
    },
    update: {
      totalDays: data.totalDays,
      usedDays: data.usedDays ?? undefined,
      pendingPrev: data.pendingPrev ?? undefined,
      observations: data.observations ?? undefined,
    },
    create: {
      employeeId: data.employeeId,
      year: data.year,
      totalDays: data.totalDays,
      usedDays: data.usedDays ?? 0,
      pendingPrev: data.pendingPrev ?? 0,
      observations: data.observations,
    },
  });
}

export async function getVacationRequests(filters?: { state?: string; employeeId?: string }) {
  return prisma.leaveRequest.findMany({
    where: {
      type: "VACACIONES",
      ...(filters?.state && { state: filters.state as any }),
      ...(filters?.employeeId && { employeeId: filters.employeeId }),
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { submissionDate: "desc" },
  });
}

export async function getVacationsSummary(year?: number) {
  const targetYear = year ?? new Date().getFullYear();
  const records = await prisma.vacation.findMany({
    where: { year: targetYear },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { employee: { lastName: "asc" } },
  });

  const totalEmployees = records.length;
  const totalDaysAllocated = records.reduce((s, v) => s + v.totalDays, 0);
  const totalDaysUsed = records.reduce((s, v) => s + v.usedDays, 0);
  const totalPending = records.reduce((s, v) => s + v.pendingPrev, 0);

  return {
    year: targetYear,
    totalEmployees,
    totalDaysAllocated,
    totalDaysUsed,
    totalPending,
    availableDays: totalDaysAllocated + totalPending - totalDaysUsed,
    employees: records.map((v) => ({
      id: v.id,
      employeeId: v.employeeId,
      employeeName: `${v.employee.firstName} ${v.employee.lastName}`,
      department: v.employee.department.name,
      totalDays: v.totalDays,
      usedDays: v.usedDays,
      pendingPrev: v.pendingPrev,
      availableDays: v.totalDays + v.pendingPrev - v.usedDays,
    })),
  };
}
