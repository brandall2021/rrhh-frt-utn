import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendBirthdayEmail } from "@/lib/mail";
import { prisma } from "@/lib/db";
import { birthdayMailSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = birthdayMailSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "employeeId requerido" }, { status: 400 });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parsed.data.employeeId },
      select: { firstName: true, lastName: true, email: true, birthDate: true, department: { select: { name: true } } },
    });

    if (!employee) {
      return Response.json({ error: "Empleado no encontrado" }, { status: 404 });
    }

    const fullName = `${employee.firstName} ${employee.lastName}`;
    const birthDateStr = employee.birthDate.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
    const age = new Date().getFullYear() - employee.birthDate.getFullYear();

    const sent = await sendBirthdayEmail(employee.email, fullName, {
      birthDate: birthDateStr,
      age: String(age),
      department: employee.department.name,
    });

    if (!sent) {
      return Response.json({ error: "Error al enviar email" }, { status: 500 });
    }

    return Response.json({ data: { sent: true, to: employee.email } });
  } catch (err) {
    console.error("Error sending birthday email:", err);
    return Response.json({ error: "Error al enviar email de cumpleaños" }, { status: 500 });
  }
}
