import { prisma } from "./db";
import type { RequestState } from "@prisma/client";
import { requestCreateSchema } from "./validation";

export async function getRequests(filters?: { state?: RequestState; employeeId?: string }) {
  const records = await prisma.leaveRequest.findMany({
    where: {
      ...(filters?.state && { state: filters.state }),
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
    orderBy: { submissionDate: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
    department: r.employee.department.name,
    type: r.type,
    startDate: r.startDate.toISOString().slice(0, 10),
    endDate: r.endDate.toISOString().slice(0, 10),
    days: r.days,
    state: r.state,
    observations: r.observations ?? undefined,
    attachedFile: r.attachedFile ?? undefined,
    submissionDate: r.submissionDate.toISOString().slice(0, 10),
  }));
}

export async function createRequest(data: Record<string, unknown>) {
  const parsed = requestCreateSchema.parse(data);
  return prisma.leaveRequest.create({
    data: {
      employeeId: parsed.employeeId,
      type: parsed.type,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      days: parsed.days,
      observations: parsed.observations,
      attachedFile: parsed.attachedFile,
    },
  });
}

export const VALID_TRANSITIONS: Record<string, RequestState[]> = {
  PENDIENTE: ["APROBADO", "RECHAZADO"],
  APROBADO: ["PROCESADO"],
  RECHAZADO: [],
  PROCESADO: [],
};

export function canTransition(from: RequestState, to: RequestState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function updateRequestState(id: string, newState: RequestState) {
  const existing = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!existing) return null;
  if (!canTransition(existing.state, newState)) {
    throw new Error(`Transición inválida: ${existing.state} → ${newState}`);
  }
  return prisma.leaveRequest.update({ where: { id }, data: { state: newState } });
}
