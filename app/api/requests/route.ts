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

  const body = await request.json();
  const req = await createRequest({
    ...body,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
  });
  return Response.json({ data: req }, { status: 201 });
}
