import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await prisma.document.findUnique({ where: { id: params.docId } });
  if (!doc || doc.employeeId !== params.id) {
    return Response.json({ error: "Documento no encontrado" }, { status: 404 });
  }

  try {
    await unlink(join(process.cwd(), "uploads", doc.fileName));
  } catch {
    // El archivo puede no existir en disco, continuar igual
  }

  await prisma.document.delete({ where: { id: params.docId } });
  return Response.json({ success: true });
}
