import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateRequestState } from "@/lib/requests";
import type { RequestState } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let state: RequestState;
  try {
    const body = await request.json();
    state = body.state;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const updated = await updateRequestState(params.id, state);
    if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ data: updated });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
