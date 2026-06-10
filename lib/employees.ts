import { prisma } from "./db";
import type { Employee } from "@prisma/client";

export type CreateEmployeeInput = Omit<Employee, "createdAt" | "updatedAt">;

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

export async function getEmployees() {
  const employees = await prisma.employee.findMany({
    orderBy: [{ status: "asc" }, { lastName: "asc" }],
    include: { documents: { select: { status: true } } },
  });
  return employees.map((emp) => ({
    ...emp,
    ...computeDocStats(emp.documents),
    workedDaysThisMonth: 0,
    totalDaysThisMonth: 22,
  }));
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      leaveRequests: { orderBy: { submissionDate: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      paySlips: { orderBy: { generatedDate: "desc" } },
    },
  });
  if (!employee) return null;
  return {
    ...employee,
    ...computeDocStats(employee.documents),
    workedDaysThisMonth: 0,
    totalDaysThisMonth: 22,
  };
}

export async function createEmployee(data: CreateEmployeeInput) {
  return prisma.employee.create({
    data: {
      ...data,
      emergencyContact: data.emergencyContact as any,
    },
  });
}

export async function updateEmployee(
  id: string,
  data: Partial<CreateEmployeeInput>
) {
  return prisma.employee.update({
    where: { id },
    data: {
      ...data,
      emergencyContact: data.emergencyContact ? (data.emergencyContact as any) : undefined,
    },
  });
}
