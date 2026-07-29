import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return Response.json({ data: users });
}
