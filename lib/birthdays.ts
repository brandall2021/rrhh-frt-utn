import { prisma } from "./db";

function getMonthDay(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface UpcomingBirthday {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  departmentId: string;
  birthDate: string;
  age: number;
  daysUntil: number;
}

export async function getUpcomingBirthdays(daysAhead = 30): Promise<UpcomingBirthday[]> {
  const today = new Date();
  const todayMD = getMonthDay(today);

  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVO" },
    include: { department: { select: { id: true, name: true } } },
  });

  const result: UpcomingBirthday[] = [];

  for (const emp of employees) {
    const bd = new Date(emp.birthDate);
    const bdMD = getMonthDay(bd);

    let thisYearBday = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
    if (thisYearBday < today) {
      thisYearBday = new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate());
    }

    const diffTime = thisYearBday.getTime() - today.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysUntil <= daysAhead) {
      const age = today.getFullYear() - bd.getFullYear() - (todayMD < bdMD ? 1 : 0);
      result.push({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department.name,
        departmentId: emp.department.id,
        birthDate: bd.toISOString().slice(0, 10),
        age,
        daysUntil,
      });
    }
  }

  result.sort((a, b) => a.daysUntil - b.daysUntil);
  return result;
}
