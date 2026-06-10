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

  const body = await request.json();
  const employee = await createEmployee(body);
  return Response.json({ data: employee }, { status: 201 });
}
