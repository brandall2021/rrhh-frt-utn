import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTemplate, saveTemplate, deleteTemplate } from "@/lib/templates";
import { templateUpdateSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-error";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  const template = await getTemplate(params.id);
  if (!template) return apiError("Plantilla no encontrada", 404);
  return apiSuccess(template);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  let body: unknown;
  try { body = await request.json(); } catch {
    return apiError("JSON inválido", 400);
  }

  const parsed = templateUpdateSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const existing = await getTemplate(params.id);
  if (!existing) return apiError("Plantilla no encontrada", 404);

  const updated = await saveTemplate({ name: existing.name, ...parsed.data }, params.id);
  return apiSuccess(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  await deleteTemplate(params.id);
  return apiSuccess({ success: true });
}
