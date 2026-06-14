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
    console.error("Error fetching birthdays:", err);
    return Response.json({ error: "Error al obtener cumpleaños" }, { status: 500 });
  }
}
