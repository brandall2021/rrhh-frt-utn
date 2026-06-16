import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, getClientIp, diffAbsences } from "@/lib/audit";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ABSENCES_FILE = path.join(DATA_DIR, "absences.json");

function readAbsences(): Record<string, any[]> {
  try {
    if (fs.existsSync(ABSENCES_FILE)) {
      return JSON.parse(fs.readFileSync(ABSENCES_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function writeAbsences(data: Record<string, any[]>) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ABSENCES_FILE, JSON.stringify(data, null, 2));
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const all = readAbsences();
  return Response.json({ data: all[params.id] || [] });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { absences?: any[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const oldAbsences = readAbsences();
  const oldList = oldAbsences[params.id] || [];
  const newList = body.absences ?? [];

  const ip = getClientIp(request);
  const adminEmail = session.user?.email ?? "desconocido";
  const adminName = (session.user as any)?.name ?? undefined;

  // Get employee name
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    select: { firstName: true, lastName: true },
  });
  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : params.id;

  // Diff and log
  const { added, removed } = diffAbsences(oldList, newList, params.id, employeeName);

  for (const entry of [...added, ...removed]) {
    await logAudit({
      ...entry,
      performedBy: adminEmail,
      adminName,
      ipAddress: ip,
    });
  }

  // Save
  oldAbsences[params.id] = newList;
  writeAbsences(oldAbsences);

  return Response.json({ data: newList });
}
