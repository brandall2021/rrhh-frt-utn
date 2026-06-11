import { prisma } from "./db";
import type { RequestState } from "@prisma/client";

export async function getRequests(filters?: { state?: RequestState; employeeId?: string }) {
  return prisma.leaveRequest.findMany({
    where: {
      ...(filters?.state && { state: filters.state }),
      ...(filters?.employeeId && { employeeId: filters.employeeId }),
    },
    include: {
      employee: { select: { firstName: true, lastName: true, department: true } },
    },
    orderBy: { submissionDate: "desc" },
  });
}

export async function createRequest(data: {
  employeeId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  days: number;
  observations?: string;
  attachedFile?: string;
}) {
  return prisma.leaveRequest.create({ data: data as any });
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
