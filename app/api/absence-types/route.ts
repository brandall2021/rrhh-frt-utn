import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { AbsenceType } from "@/types";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "absence-types.json");

const DEFAULT_TYPES: AbsenceType[] = [
  { id: "enfermedad", name: "Enfermedad", code: "ENF", color: "red" },
  { id: "particular", name: "Particular", code: "PAR", color: "amber" },
  { id: "estudio", name: "Estudio", code: "EST", color: "blue" },
  { id: "compensatorio", name: "Compensatorio", code: "COM", color: "emerald" },
  { id: "medica", name: "Licencia Médica", code: "MED", color: "orange" },
  { id: "maternidad", name: "Maternidad", code: "MAT", color: "purple" },
  { id: "ausencia", name: "Ausencia", code: "AUS", color: "slate" },
];

let cached: AbsenceType[] | null = null;

async function load(): Promise<AbsenceType[]> {
  if (cached) return cached;
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    cached = JSON.parse(raw);
    return cached!;
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(DEFAULT_TYPES, null, 2));
    cached = DEFAULT_TYPES;
    return cached;
  }
}

async function save(types: AbsenceType[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(types, null, 2));
  cached = types;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const types = await load();
  return Response.json({ data: types });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const types: AbsenceType[] = body.types;
    if (!Array.isArray(types)) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }
    await save(types);
    return Response.json({ data: types });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
