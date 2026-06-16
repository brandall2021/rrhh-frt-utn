import { prisma } from "./db";

export interface AuditEntry {
  action: "CREATE" | "DELETE";
  entityType: "AUSENCIA" | "LICENCIA";
  entityId?: string;
  employeeId?: string;
  employeeName?: string;
  description: string;
  performedBy: string;
  adminName?: string;
  ipAddress?: string;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({ data: entry });
}

export async function getAuditLogs(
  limit = 200,
  offset = 0
): Promise<{ id: string; action: string; entityType: string; entityId: string | null; employeeId: string | null; employeeName: string | null; description: string; performedBy: string; adminName: string | null; ipAddress: string | null; createdAt: Date }[]> {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function getAuditLogsTotal(): Promise<number> {
  return prisma.auditLog.count();
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "desconocida";
}

export function diffAbsences(
  oldList: { id: string; date: string; absenceTypeId: string }[],
  newList: { id: string; date: string; absenceTypeId: string }[],
  employeeId: string,
  employeeName: string
): { added: AuditEntry[]; removed: AuditEntry[] } {
  const oldMap = new Map(oldList.map((a) => [a.date, a]));
  const newMap = new Map(newList.map((a) => [a.date, a]));

  const added: AuditEntry[] = [];
  const removed: AuditEntry[] = [];

  for (const [date, abs] of newMap) {
    if (!oldMap.has(date)) {
      added.push({
        action: "CREATE",
        entityType: "AUSENCIA",
        entityId: abs.id,
        employeeId,
        employeeName,
        description: `Ausencia creada para ${date}`,
        performedBy: "",
        adminName: "",
        ipAddress: "",
      });
    }
  }

  for (const [date, abs] of oldMap) {
    if (!newMap.has(date)) {
      removed.push({
        action: "DELETE",
        entityType: "AUSENCIA",
        entityId: abs.id,
        employeeId,
        employeeName,
        description: `Ausencia eliminada para ${date}`,
        performedBy: "",
        adminName: "",
        ipAddress: "",
      });
    }
  }

  return { added, removed };
}
