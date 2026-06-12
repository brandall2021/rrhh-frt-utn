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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    workedDaysThisMonth,
    totalDaysThisMonth,
    totalFiles,
    vigenteFiles,
    vencidosFiles,
    rechazadosFiles,
    ...cleanBody
  } = body;

  try {
    const employee = await createEmployee({
      ...cleanBody,
      hireDate: new Date(cleanBody.hireDate),
      birthDate: new Date(cleanBody.birthDate),
    });
    return Response.json({ data: employee }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Error creating employee" }, { status: 500 });
  }
}
