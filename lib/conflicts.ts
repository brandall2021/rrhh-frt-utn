export type ConflictRequest = {
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: Date;
  endDate: Date;
  state: string;
};

export type ConflictResult = {
  id: string;
  team: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  description: string;
  statusText: string;
  relatedRequests: {
    employeeName: string;
    state: string;
    range: string;
    type: string;
  }[];
};

export function detectConflicts(requests: ConflictRequest[]): ConflictResult[] {
  const active = requests.filter(
    (r) => r.state === "PENDIENTE" || r.state === "APROBADO"
  );

  const byDept = new Map<string, ConflictRequest[]>();
  for (const r of active) {
    if (!byDept.has(r.department)) byDept.set(r.department, []);
    byDept.get(r.department)!.push(r);
  }

  const conflicts: ConflictResult[] = [];

  for (const [dept, deptReqs] of byDept.entries()) {
    if (deptReqs.length < 2) continue;

    const overlapping = new Set<ConflictRequest>();
    for (let i = 0; i < deptReqs.length; i++) {
      for (let j = i + 1; j < deptReqs.length; j++) {
        const a = deptReqs[i];
        const b = deptReqs[j];
        if (a.startDate <= b.endDate && b.startDate <= a.endDate) {
          overlapping.add(a);
          overlapping.add(b);
        }
      }
    }

    if (overlapping.size === 0) continue;

    const list = Array.from(overlapping);
    const severity = list.length >= 3 ? "CRITICAL" : "WARNING";

    conflicts.push({
      id: `CONF-${dept.replace(/\s+/g, "-").toUpperCase()}`,
      team: dept,
      severity,
      description: `${list.length} empleados de ${dept} tienen solicitudes superpuestas.`,
      statusText: `${list.length} solicitudes superpuestas`,
      relatedRequests: list.map((r) => ({
        employeeName: r.employeeName,
        state: r.state,
        range: `${r.startDate.toLocaleDateString("es-AR")} - ${r.endDate.toLocaleDateString("es-AR")}`,
        type: r.type,
      })),
    });
  }

  return conflicts;
}
