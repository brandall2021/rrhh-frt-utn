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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const employee = await createEmployee(body as any);
    return Response.json({ data: employee }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Error creating employee" }, { status: 500 });
  }
}
