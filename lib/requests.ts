import { prisma } from "./db";
import { Prisma } from "@prisma/client";
import type { RequestState } from "@prisma/client";
import { requestCreateSchema } from "./validation";
import { logAudit } from "./audit";

export async function getRequests(filters?: {
  state?: RequestState;
  employeeId?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  take?: number;
}) {
  const where: Prisma.LeaveRequestWhereInput = {};
  if (filters?.state) where.state = filters.state;
  if (filters?.employeeId) where.employeeId = filters.employeeId;
  if (filters?.department) {
    where.employee = { department: { name: filters.department } };
  }
  if (filters?.dateFrom || filters?.dateTo) {
    const startFilter: Prisma.DateTimeFilter = {};
    if (filters.dateFrom) startFilter.gte = new Date(filters.dateFrom);
    if (filters.dateTo) startFilter.lte = new Date(filters.dateTo);
    where.startDate = startFilter;
  }

  const [records, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
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
      skip: filters?.skip ?? 0,
      take: filters?.take ?? 200,
    }),
    prisma.leaveRequest.count({ where }),
  ]);

  const items = records.map((r) => ({
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

  return { items, total };
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

export async function updateRequestState(
  id: string,
  newState: RequestState,
  opts?: { performedBy?: string; adminName?: string; ipAddress?: string; employeeName?: string }
) {
  const existing = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!existing) return null;
  if (!canTransition(existing.state, newState)) {
    throw new Error(`Transición inválida: ${existing.state} → ${newState}`);
  }
  const updated = await prisma.leaveRequest.update({ where: { id }, data: { state: newState } });

  if (opts?.performedBy) {
    await logAudit({
      action: "UPDATE",
      entityType: "SOLICITUD",
      entityId: id,
      description: `Solicitud ${id}: estado cambiado de ${existing.state} a ${newState}`,
      performedBy: opts.performedBy,
      adminName: opts.adminName,
      ipAddress: opts.ipAddress,
    });
  }

  return updated;
}
