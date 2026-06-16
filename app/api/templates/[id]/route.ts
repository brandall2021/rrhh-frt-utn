import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTemplate, saveTemplate, deleteTemplate } from "@/lib/templates";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const template = await getTemplate(params.id);
  if (!template) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ data: template });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { subject, body: htmlBody } = body as any;
  if (!subject || !htmlBody) {
    return Response.json({ error: "subject y body son requeridos" }, { status: 400 });
  }

  const updated = await saveTemplate({ subject, body: htmlBody, name: "" }, params.id);
  return Response.json({ data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await deleteTemplate(params.id);
  return Response.json({ success: true });
}
