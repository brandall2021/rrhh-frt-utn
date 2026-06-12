import { prisma } from "./db";
import { Prisma } from "@prisma/client";

const CATEGORY_LABELS: Record<string, string> = {
  IDENTIDAD: "Identidad",
  ACADEMICO: "Académico",
  CONTRACTUAL: "Contractual",
  MEDICO: "Médico",
  LEGALES: "Legales",
};

const STATUS_LABELS: Record<string, string> = {
  VIGENTE: "VIGENTE",
  POR_VENCER: "POR VENCER",
  EXPIRADO: "EXPIRADO",
  RECHAZADO: "RECHAZADO",
};

function computeDocStats(documents: { status: string }[]) {
  return {
    totalFiles: documents.length,
    vigenteFiles: documents.filter((d) => d.status === "VIGENTE").length,
    vencidosFiles: documents.filter(
      (d) => d.status === "EXPIRADO" || d.status === "POR_VENCER"
    ).length,
    rechazadosFiles: documents.filter((d) => d.status === "RECHAZADO").length,
  };
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export async function getEmployees() {
  const employees = await prisma.employee.findMany({
    orderBy: [{ status: "asc" }, { lastName: "asc" }],
    include: {
      documents: { select: { status: true } },
      department: { select: { id: true, name: true } },
    },
  });

  return employees.map(({ department, documents, hireDate, exitDate, birthDate, createdAt, updatedAt, ...rest }) => ({
    ...rest,
    department: department.name,
    departmentId: department.id,
    hireDate: formatDate(hireDate),
    exitDate: exitDate ? formatDate(exitDate) : undefined,
    birthDate: formatDate(birthDate),
    ...computeDocStats(documents),
    workedDaysThisMonth: 0,
    totalDaysThisMonth: 22,
  }));
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true } },
      leaveRequests: { orderBy: { submissionDate: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      paySlips: { orderBy: { generatedDate: "desc" } },
    },
  });
  if (!employee) return null;

  const { department, documents, leaveRequests, paySlips, hireDate, exitDate, birthDate, createdAt, updatedAt, ...rest } = employee;

  return {
    ...rest,
    department: department.name,
    departmentId: department.id,
    hireDate: formatDate(hireDate),
    exitDate: exitDate ? formatDate(exitDate) : undefined,
    birthDate: formatDate(birthDate),
    ...computeDocStats(documents),
    documents: documents.map((d) => ({
      id: d.id,
      name: d.name,
      fileName: d.fileName,
      category: (CATEGORY_LABELS[d.category] ?? d.category) as "Identidad" | "Académico" | "Contractual" | "Médico" | "Legales",
      status: (STATUS_LABELS[d.status] ?? d.status) as "VIGENTE" | "POR VENCER" | "EXPIRADO" | "RECHAZADO",
      expiryDate: d.expiryDate ? formatDate(d.expiryDate) : undefined,
      updatedDate: formatDate(d.updatedAt),
      rejectReason: d.rejectReason ?? undefined,
    })),
    workedDaysThisMonth: 0,
    totalDaysThisMonth: 22,
  };
}

export async function createEmployee(data: Record<string, unknown>) {
  return prisma.employee.create({
    data: data as any,
  });
}

export async function updateEmployee(id: string, data: Record<string, unknown>) {
  const { department, workedDaysThisMonth, totalDaysThisMonth, totalFiles, vigenteFiles, vencidosFiles, rechazadosFiles, documents, ...clean } = data as any;
  try {
    return await prisma.employee.update({
      where: { id },
      data: {
        ...clean,
        hireDate: clean.hireDate ? new Date(clean.hireDate as string) : undefined,
        exitDate: clean.exitDate ? new Date(clean.exitDate as string) : undefined,
        birthDate: clean.birthDate ? new Date(clean.birthDate as string) : undefined,
        emergencyContact: clean.emergencyContact ? clean.emergencyContact : undefined,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return null;
    }
    throw err;
  }
}
