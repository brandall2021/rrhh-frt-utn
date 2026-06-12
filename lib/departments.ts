import { prisma } from "./db";

export async function getDepartments(activeOnly = false) {
  return prisma.department.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function createDepartment(name: string) {
  return prisma.department.create({ data: { name } });
}

export async function updateDepartment(id: string, data: { name?: string; active?: boolean }) {
  return prisma.department.update({ where: { id }, data });
}

export async function deactivateDepartment(id: string) {
  const activeCount = await prisma.employee.count({
    where: { departmentId: id, status: "ACTIVO" },
  });
  if (activeCount > 0) {
    throw new Error(
      `No se puede dar de baja: hay ${activeCount} empleado(s) activo(s) en este departamento.`
    );
  }
  return prisma.department.update({ where: { id }, data: { active: false } });
}
