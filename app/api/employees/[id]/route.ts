import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEmployeeById, updateEmployee } from "@/lib/employees";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const employee = await getEmployeeById(params.id);
  if (!employee) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ data: employee });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const employee = await updateEmployee(params.id, body);
    if (!employee) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ data: employee });
  } catch (err) {
    console.error("Error updating employee:", err);
    if (err instanceof Error && err.name === "ZodError") {
      return Response.json({ error: "Datos inválidos", details: (err as any).issues }, { status: 400 });
    }
    return Response.json({ error: "Error al actualizar empleado" }, { status: 500 });
  }
}
