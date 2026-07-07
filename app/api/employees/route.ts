import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEmployees, createEmployee } from "@/lib/employees";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url)
  const search = url.searchParams.get('search') || undefined
  const limit = Math.min(Number(url.searchParams.get('limit')) || 200, 500)
  const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0)

  const result = await getEmployees({ search, limit, offset });
  return Response.json(result);
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

  try {
    const employee = await createEmployee(body);
    return Response.json({ data: employee }, { status: 201 });
  } catch (err) {
    console.error("Error creating employee:", err);
    if (err instanceof Error && err.name === "ZodError") {
      return Response.json({ error: "Datos inválidos", details: (err as any).issues }, { status: 400 });
    }
    return Response.json({ error: "Error al crear empleado" }, { status: 500 });
  }
}
