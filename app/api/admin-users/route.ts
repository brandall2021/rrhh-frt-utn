import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminUserCreateSchema, adminUserUpdateSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleZodError } from "@/lib/api-error";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(users);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  let body: unknown;
  try { body = await request.json(); }
  catch { return apiError("JSON inválido", 400); }

  const parsed = adminUserCreateSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) return apiError("El usuario ya existe", 409);

  const user = await prisma.adminUser.create({
    data: { email: parsed.data.email, name: parsed.data.name ?? null },
  });

  return apiSuccess(user, 201);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("No autorizado", 401);

  let body: unknown;
  try { body = await request.json(); }
  catch { return apiError("JSON inválido", 400); }

  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const data: Record<string, unknown> = {};
  if (parsed.data.role) data.role = parsed.data.role;
  if (parsed.data.status) data.status = parsed.data.status;

  try {
    const user = await prisma.adminUser.update({
      where: { id: parsed.data.id },
      data,
    });
    return apiSuccess(user);
  } catch {
    return apiError("Usuario no encontrado", 404);
  }
}
