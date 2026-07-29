import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ data: users });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.email) {
    return Response.json({ error: "Email es requerido" }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: body.email } });
  if (existing) {
    return Response.json({ error: "El usuario ya existe" }, { status: 409 });
  }

  const user = await prisma.adminUser.create({
    data: { email: body.email, name: body.name ?? null },
  });

  return Response.json({ data: user }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { id?: string; role?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) {
    return Response.json({ error: "ID es requerido" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.role) data.role = body.role;
  if (body.status) data.status = body.status;

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Sin cambios" }, { status: 400 });
  }

  try {
    const user = await prisma.adminUser.update({
      where: { id: body.id },
      data,
    });
    return Response.json({ data: user });
  } catch {
    return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
}
