import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUpcomingBirthdays } from "@/lib/birthdays";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await getUpcomingBirthdays();
    return Response.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error fetching birthdays";
    return Response.json({ error: message }, { status: 500 });
  }
}
