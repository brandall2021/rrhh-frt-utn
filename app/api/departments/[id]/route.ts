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
    if (typeof body.name === "string") updateData.name = body.name.trim();
    if (typeof body.active === "boolean") updateData.active = body.active;
    const data = await updateDepartment(params.id, updateData);
    return Response.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error updating department";
    const status = message.includes("empleado") ? 409 : 500;
    return Response.json({ error: message }, { status });
  }
}
