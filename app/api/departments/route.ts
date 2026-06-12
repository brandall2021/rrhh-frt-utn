import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDepartments, createDepartment } from "@/lib/departments";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "true";
  const data = await getDepartments(activeOnly);
  return Response.json({ data });
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  try {
    const data = await createDepartment(name);
    return Response.json({ data }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json({ error: "Ya existe un departamento con ese nombre" }, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "Error creating department";
    return Response.json({ error: message }, { status: 500 });
  }
}
