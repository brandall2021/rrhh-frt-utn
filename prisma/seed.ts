import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MONTHS: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function parseSpanishDate(dateStr: string): Date {
  const clean = dateStr.replace(/\(.*\)/, "").trim();
  const [dayPart, rest] = clean.split(" de ");
  const [monthStr, yearStr] = rest.split(", ");
  const day = parseInt(dayPart);
  const month = MONTHS[monthStr.toLowerCase()];
  const year = parseInt(yearStr);
  return new Date(year, month, day);
}

async function main() {
  console.log("Seeding...");

  const admins = [
    { email: "admin@precisionhr.com", name: "Admin" },
    { email: "personal@face.unt.edu.ar", name: "Personal" },
    { email: process.env.ADMIN_EMAIL || "", name: "Admin Principal" },
  ];

  for (const a of admins) {
    if (!a.email) continue;
    await prisma.adminUser.upsert({
      where: { email: a.email },
      update: {},
      create: a,
    });
  }

  // Upsert departments
  const departmentNames = ["IT & Desarrollo", "Operaciones", "Marketing", "IT Ops", "Ventas"];
  const departmentMap: Record<string, string> = {};
  for (const name of departmentNames) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    departmentMap[name] = dept.id;
  }

  const employees = [
    {
      id: "EMP-2941",
      firstName: "Rodrigo Hernán",
      lastName: "Silva",
      departmentId: departmentMap["IT & Desarrollo"],
      role: "Senior Fullstack Developer",
      status: "ACTIVO" as const,
      hireDate: parseSpanishDate("02 de Enero, 2019"),
      email: "r.silva@precisionhr.com",
      phone: "+54 11 4455-2233",
      cuil: "20-33842910-8",
      birthDate: parseSpanishDate("14 de Mayo, 1988"),
      maritalStatus: "Casado",
      address: "Av. del Libertador 4500, Piso 12B, CABA",
      emergencyContact: { name: "Laura Montenegro", relationship: "Esposa", phone: "+54 11 5566-7788" },
    },
    {
      id: "EMP-24592",
      firstName: "Luis Angel",
      lastName: "Batallan",
      departmentId: departmentMap["Operaciones"],
      role: "Administrador de Infraestructura",
      status: "ACTIVO" as const,
      hireDate: parseSpanishDate("15 de Marzo, 2015"),
      email: "l.batallan@precisionhr.com",
      phone: "+54 11 9988-7766",
      cuil: "20-24592331-9",
      birthDate: parseSpanishDate("28 de Agosto, 1982"),
      maritalStatus: "Casado",
      address: "Av. Santa Fe 1200, Palermo, CABA",
      emergencyContact: { name: "María Batallan", relationship: "Hermana", phone: "+54 11 8877-6655" },
    },
    {
      id: "EMP-2948",
      firstName: "Martina",
      lastName: "Rodriguez",
      departmentId: departmentMap["Marketing"],
      role: "Social Media Strategist",
      status: "ACTIVO" as const,
      hireDate: parseSpanishDate("15 de Julio, 2021"),
      email: "m.rodriguez@precisionhr.com",
      phone: "+54 11 3456-7890",
      cuil: "27-29488392-4",
      birthDate: parseSpanishDate("03 de Noviembre, 1994"),
      maritalStatus: "Soltero",
      address: "Sarmiento 845, Almagro, CABA",
      emergencyContact: { name: "Esteban Rodriguez", relationship: "Padre", phone: "+54 11 2345-6789" },
    },
    {
      id: "EMP-4410",
      firstName: "Javier",
      lastName: "Casal",
      departmentId: departmentMap["IT Ops"],
      role: "Database Administrator",
      status: "ACTIVO" as const,
      hireDate: parseSpanishDate("10 de Abril, 2020"),
      email: "j.casal@precisionhr.com",
      phone: "+54 11 4321-8765",
      cuil: "20-44101928-3",
      birthDate: parseSpanishDate("19 de Junio, 1990"),
      maritalStatus: "Soltero",
      address: "Corrientes 3400, CABA",
      emergencyContact: { name: "Sofía Casal", relationship: "Madre", phone: "+54 11 1234-5678" },
    },
    {
      id: "EMP-1122",
      firstName: "Sofia",
      lastName: "Mendez",
      departmentId: departmentMap["Ventas"],
      role: "Ejecutivo de Cuentas Senior",
      status: "ACTIVO" as const,
      hireDate: parseSpanishDate("11 de Septiembre, 2018"),
      email: "s.mendez@precisionhr.com",
      phone: "+54 11 8765-4321",
      cuil: "27-11223948-2",
      birthDate: parseSpanishDate("21 de Diciembre, 1985"),
      maritalStatus: "Divorciado",
      address: "Cabildo 2000, Belgrano, CABA",
      emergencyContact: { name: "Marcos Mendez", relationship: "Hijo", phone: "+54 11 8765-4321" },
    },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {},
      create: emp,
    });
  }

  await prisma.leaveRequest.upsert({
    where: { id: "REQ-01" },
    update: {},
    create: {
      id: "REQ-01",
      employeeId: "EMP-2948",
      type: "ESTUDIO",
      startDate: new Date("2025-10-15"),
      endDate: new Date("2025-10-18"),
      days: 4,
      state: "PENDIENTE",
      observations: "Examen final de Planificación Estratégica Digital (UADE).",
      submissionDate: new Date("2025-10-01"),
    },
  });

  await prisma.leaveRequest.upsert({
    where: { id: "REQ-02" },
    update: {},
    create: {
      id: "REQ-02",
      employeeId: "EMP-4410",
      type: "PARTICULAR",
      startDate: new Date("2025-10-20"),
      endDate: new Date("2025-10-20"),
      days: 1,
      state: "PENDIENTE",
      observations: "Trámite de renovación de pasaporte en RENAPER.",
      submissionDate: new Date("2025-10-05"),
    },
  });

  // Seed birthday email template
  await prisma.emailTemplate.upsert({
    where: { name: "birthday" },
    update: {},
    create: {
      name: "birthday",
      subject: "Feliz Cumpleaños, {{employeeName}}!",
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #D60000;">Feliz Cumplea&ntilde;os, {{employeeName}}!</h1>
  <p>Queremos desearte un muy feliz d&iacute;a lleno de alegr&iacute;a y &eacute;xito.</p>
  <p>Que este nuevo a&ntilde;o de vida est&eacute; lleno de grandes logros y momentos inolvidables.</p>
  <br>
  <p style="color: #666;">Atentamente,</p>
  <p style="color: #D60000; font-weight: bold;">FACE UNT - Recursos Humanos</p>
</div>`,
    },
  });

  console.log("Seed completado.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
