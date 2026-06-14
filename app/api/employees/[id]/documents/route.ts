import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE } from "@/lib/validation";

const CATEGORY_MAP: Record<string, string> = {
  Identidad: "IDENTIDAD",
  Académico: "ACADEMICO",
  Contractual: "CONTRACTUAL",
  Médico: "MEDICO",
  Legales: "LEGALES",
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string | null;
  const categoryLabel = formData.get("category") as string | null;
  const expiryDateStr = formData.get("expiryDate") as string | null;

  if (!file || !name?.trim() || !categoryLabel) {
    return Response.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as any)) {
    return Response.json({ error: "Tipo de archivo no permitido. Use PDF, JPG, PNG, WebP o Word" }, { status: 400 });
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    return Response.json({ error: "El documento no puede superar los 20MB" }, { status: 400 });
  }

  const category = CATEGORY_MAP[categoryLabel] ?? "IDENTIDAD";
  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = join(process.cwd(), "uploads", params.id);
  await mkdir(dir, { recursive: true });

  const fileId = crypto.randomUUID();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${fileId}-${safeFileName}`;
  await writeFile(join(dir, storedName), buffer);

  const doc = await prisma.document.create({
    data: {
      employeeId: params.id,
      name: name.trim(),
      fileName: `${params.id}/${storedName}`,
      category: category as any,
      status: "VIGENTE",
      expiryDate: expiryDateStr ? new Date(expiryDateStr) : undefined,
    },
  });

  return Response.json({
    data: {
      id: doc.id,
      name: doc.name,
      fileName: doc.fileName,
      category: categoryLabel,
      status: "VIGENTE",
      expiryDate: expiryDateStr ?? undefined,
      updatedDate: doc.createdAt.toISOString().slice(0, 10),
    },
  }, { status: 201 });
}
