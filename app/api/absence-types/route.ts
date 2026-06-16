import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const DEFAULT_TYPES = [
  { name: "Enfermedad", code: "ENF", color: "red" },
  { name: "Particular", code: "PAR", color: "amber" },
  { name: "Estudio", code: "EST", color: "blue" },
  { name: "Compensatorio", code: "COM", color: "emerald" },
  { name: "Licencia Médica", code: "MED", color: "orange" },
  { name: "Maternidad", code: "MAT", color: "purple" },
  { name: "Ausencia", code: "AUS", color: "slate" },
];

async function ensureDefaultTypes(): Promise<void> {
  const count = await prisma.absenceType.count();
  if (count > 0) return;

  await prisma.absenceType.createMany({
    data: DEFAULT_TYPES.map((t) => ({
      name: t.name,
      code: t.code,
      color: t.color,
    })),
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDefaultTypes();
  const types = await prisma.absenceType.findMany({ orderBy: { name: "asc" } });
  return Response.json({ data: types });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const types = body.types as { name: string; code: string; color: string }[];

    await prisma.absenceType.deleteMany();
    await prisma.absenceType.createMany({ data: types });

    const saved = await prisma.absenceType.findMany({ orderBy: { name: "asc" } });
    return Response.json({ data: saved });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
