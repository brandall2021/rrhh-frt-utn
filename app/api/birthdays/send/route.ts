import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendBirthdayEmail } from "@/lib/mail";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { employeeId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.employeeId) {
    return Response.json({ error: "employeeId is required" }, { status: 400 });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: body.employeeId },
      select: { firstName: true, lastName: true, email: true },
    });

    if (!employee) {
      return Response.json({ error: "Employee not found" }, { status: 404 });
    }

    const fullName = `${employee.firstName} ${employee.lastName}`;
    const sent = await sendBirthdayEmail(employee.email, fullName);

    if (!sent) {
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({ data: { sent: true, to: employee.email } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error sending birthday email";
    return Response.json({ error: message }, { status: 500 });
  }
}
