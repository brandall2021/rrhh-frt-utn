import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTemplates, saveTemplate } from "@/lib/templates";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getTemplates();
  return Response.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, subject, body: htmlBody } = body as any;
  if (!name || !subject || !htmlBody) {
    return Response.json({ error: "name, subject y body son requeridos" }, { status: 400 });
  }

  try {
    const template = await saveTemplate({ name, subject, body: htmlBody });
    return Response.json({ data: template }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return Response.json({ error: "Ya existe una plantilla con ese nombre" }, { status: 409 });
    }
    console.error("Error creating template:", err);
    return Response.json({ error: "Error al crear plantilla" }, { status: 500 });
  }
}
