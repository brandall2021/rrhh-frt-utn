import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";

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

  const file = formData.get("photo") as File | null;
  if (!file) return Response.json({ error: "No photo file provided" }, { status: 400 });

  const ext = extname(file.name) || ".jpg";
  const fileName = `${params.id}${ext}`;
  const uploadDir = join(process.cwd(), "public", "photos");
  const filePath = join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  return Response.json({ data: { photoUrl: `/photos/${fileName}` } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { unlink } = await import("fs/promises");
  const { readdir } = await import("fs/promises");

  const uploadDir = join(process.cwd(), "public", "photos");
  try {
    const files = await readdir(uploadDir);
    for (const f of files) {
      if (f.startsWith(params.id)) {
        await unlink(join(uploadDir, f));
      }
    }
  } catch {}

  return Response.json({ data: { photoUrl: null } });
}
