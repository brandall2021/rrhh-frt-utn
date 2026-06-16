import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const filePath = join(process.cwd(), "uploads", "photos", params.filename);

  if (!existsSync(filePath)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const ext = params.filename.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };

  const buffer = await readFile(filePath);
  return new Response(buffer, {
    headers: {
      "Content-Type": mimeMap[ext ?? ""] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
