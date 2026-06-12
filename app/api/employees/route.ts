import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEmployees, createEmployee } from "@/lib/employees";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getEmployees();
  return Response.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    workedDaysThisMonth: _1,
    totalDaysThisMonth: _2,
    totalFiles: _3,
    vigenteFiles: _4,
    vencidosFiles: _5,
    rechazadosFiles: _6,
    ...cleanBody
  } = body as Record<string, unknown> & {
    workedDaysThisMonth?: unknown;
    totalDaysThisMonth?: unknown;
    totalFiles?: unknown;
    vigenteFiles?: unknown;
    vencidosFiles?: unknown;
    rechazadosFiles?: unknown;
  };
  void _1; void _2; void _3; void _4; void _5; void _6;

  try {
    const employee = await createEmployee({
      ...(cleanBody as Parameters<typeof createEmployee>[0]),
      hireDate: new Date(cleanBody.hireDate as string),
      birthDate: new Date(cleanBody.birthDate as string),
    });
    return Response.json({ data: employee }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error creating employee";
    return Response.json({ error: message }, { status: 500 });
  }
}
