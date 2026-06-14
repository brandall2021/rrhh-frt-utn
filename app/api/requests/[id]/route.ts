import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateRequestState } from "@/lib/requests";
import { requestStateSchema } from "@/lib/validation";

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

  const parsed = requestStateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Estado inválido" }, { status: 400 });
  }

  try {
    const updated = await updateRequestState(params.id, parsed.data.state);
    if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ data: updated });
  } catch (err) {
    console.error("Error updating request state:", err);
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    return Response.json({ error: "Error al actualizar solicitud" }, { status: 500 });
  }
}
