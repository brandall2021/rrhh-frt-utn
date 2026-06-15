import { prisma } from "./db";
import { Prisma } from "@prisma/client";
import { employeeCreateSchema, employeeUpdateSchema } from "./validation";

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
    },
  });
  if (!employee) return null;

  const { department, documents, leaveRequests, hireDate, exitDate, birthDate, createdAt, updatedAt, ...rest } = employee;

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
  const parsed = employeeCreateSchema.parse(data);
  return prisma.employee.create({
    data: {
      id: `EMP-${Date.now()}`,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      cuil: parsed.cuil,
      birthDate: new Date(parsed.birthDate),
      maritalStatus: parsed.maritalStatus,
      address: parsed.address,
      departmentId: parsed.departmentId,
      role: parsed.role,
      status: parsed.status,
      hireDate: new Date(parsed.hireDate),
      exitDate: parsed.exitDate ? new Date(parsed.exitDate) : null,
      emergencyContact: (parsed.emergencyContact ?? {}) as any,
    },
  });
}

export async function updateEmployee(id: string, data: Record<string, unknown>) {
  const { ...rest } = data;
  const parsed = employeeUpdateSchema.parse(rest);
  const prismaData: Record<string, unknown> = {};
  if (parsed.firstName !== undefined) prismaData.firstName = parsed.firstName;
  if (parsed.lastName !== undefined) prismaData.lastName = parsed.lastName;
  if (parsed.email !== undefined) prismaData.email = parsed.email;
  if (parsed.phone !== undefined) prismaData.phone = parsed.phone;
  if (parsed.cuil !== undefined) prismaData.cuil = parsed.cuil;
  if (parsed.maritalStatus !== undefined) prismaData.maritalStatus = parsed.maritalStatus;
  if (parsed.address !== undefined) prismaData.address = parsed.address;
  if (parsed.departmentId !== undefined) prismaData.departmentId = parsed.departmentId;
  if (parsed.role !== undefined) prismaData.role = parsed.role;
  if (parsed.status !== undefined) prismaData.status = parsed.status;
  if (parsed.hireDate !== undefined) prismaData.hireDate = new Date(parsed.hireDate);
  if (parsed.exitDate !== undefined) prismaData.exitDate = parsed.exitDate ? new Date(parsed.exitDate) : null;
  if (parsed.birthDate !== undefined) prismaData.birthDate = new Date(parsed.birthDate);
  if (parsed.emergencyContact !== undefined) prismaData.emergencyContact = parsed.emergencyContact as any;
  try {
    return await prisma.employee.update({
      where: { id },
      data: prismaData as any,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return null;
    }
    throw err;
  }
}
