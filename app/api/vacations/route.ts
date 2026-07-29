import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getVacations, upsertVacation, getVacationsSummary } from "@/lib/vacations";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const employeeId = searchParams.get("employeeId") ?? undefined;
  const summary = searchParams.get("summary") === "true";

  if (summary) {
    const data = await getVacationsSummary(year);
    return Response.json({ data });
  }

  const data = await getVacations({ year, employeeId });
  return Response.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await upsertVacation({
      employeeId: body.employeeId as string,
      year: body.year as number,
      totalDays: body.totalDays as number,
      usedDays: body.usedDays as number | undefined,
      pendingPrev: body.pendingPrev as number | undefined,
      observations: body.observations as string | undefined,
    });
    return Response.json({ data: result }, { status: 201 });
  } catch (err) {
    console.error("Error upserting vacation:", err);
    return Response.json({ error: "Error al guardar vacaciones" }, { status: 500 });
  }
}
