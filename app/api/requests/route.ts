import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRequests, createRequest } from "@/lib/requests";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") as any;
  const employeeId = searchParams.get("employeeId") ?? undefined;

  const data = await getRequests({ state: state ?? undefined, employeeId });
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
    const req = await createRequest(body);
    return Response.json({ data: req }, { status: 201 });
  } catch (err) {
    console.error("Error creating request:", err);
    if (err instanceof Error && err.name === "ZodError") {
      return Response.json({ error: "Datos inválidos", details: (err as any).issues }, { status: 400 });
    }
    return Response.json({ error: "Error al crear solicitud" }, { status: 500 });
  }
}
