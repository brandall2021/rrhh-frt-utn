import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTemplates, saveTemplate } from "@/lib/templates";
import { templateCreateSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-error";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);
  const data = await getTemplates();
  return apiSuccess(data);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  let body: unknown;
  try { body = await request.json(); } catch {
    return apiError("JSON inválido", 400);
  }

  const parsed = templateCreateSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    const template = await saveTemplate(parsed.data);
    return apiSuccess(template, 201);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return apiError("Ya existe una plantilla con ese nombre", 409);
    }
    console.error("Error creating template:", err);
    return apiError("Error al crear plantilla", 500);
  }
}
