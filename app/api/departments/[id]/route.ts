import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateDepartment, deactivateDepartment } from "@/lib/departments";

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
    const updateData: { name?: string; active?: boolean } = {};
    if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
    if (typeof body.active === "boolean") updateData.active = body.active;
    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }
    const data = await updateDepartment(params.id, updateData);
    return Response.json({ data });
  } catch (err) {
    // deactivateDepartment lanza Error simple (sin .code) cuando hay empleados activos → 409
    // Los errores de Prisma tienen .code → 500
    if (err instanceof Error && !(err as any).code) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "Error updating department";
    return Response.json({ error: message }, { status: 500 });
  }
}
