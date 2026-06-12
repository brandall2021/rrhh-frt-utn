import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const uploadsBase = join(process.cwd(), "uploads");
  const filePath = join(uploadsBase, ...params.path);

  if (!filePath.startsWith(uploadsBase + "/") && filePath !== uploadsBase) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const file = await readFile(filePath);
    const ext = params.path[params.path.length - 1].split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new Response(file, { headers: { "Content-Type": contentType } });
  } catch {
    return Response.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
