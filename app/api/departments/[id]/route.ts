import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateDepartment, deactivateDepartment } from "@/lib/departments";
import { departmentUpdateSchema } from "@/lib/validation";

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
    if (body.active === false) {
      const data = await deactivateDepartment(params.id);
      return Response.json({ data });
    }
    const parsed = departmentUpdateSchema.parse(body);
    if (Object.keys(parsed).length === 0) {
      return Response.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }
    const data = await updateDepartment(params.id, parsed);
    return Response.json({ data });
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return Response.json({ error: "Datos inválidos" }, { status: 400 });
    }
    if (err instanceof Error && !(err as any).code) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    console.error("Error updating department:", err);
    return Response.json({ error: "Error al actualizar departamento" }, { status: 500 });
  }
}
