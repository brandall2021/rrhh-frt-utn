import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { detectConflicts } from "@/lib/conflicts";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.leaveRequest.findMany({
    where: { state: { in: ["PENDIENTE", "APROBADO"] } },
    include: {
      employee: { select: { firstName: true, lastName: true, department: true } },
    },
  });

  const formatted = requests.map((r) => ({
    employeeId: r.employeeId,
    employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
    department: r.employee.department,
    type: r.type,
    startDate: r.startDate,
    endDate: r.endDate,
    state: r.state,
  }));

  const conflicts = detectConflicts(formatted);
  return Response.json({ data: conflicts });
}
