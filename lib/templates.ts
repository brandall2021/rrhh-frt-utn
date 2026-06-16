import { prisma } from "./db";

export interface TemplateData {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getTemplates(): Promise<TemplateData[]> {
  return prisma.emailTemplate.findMany({ orderBy: { name: "asc" } });
}

export async function getTemplateByName(name: string): Promise<TemplateData | null> {
  return prisma.emailTemplate.findUnique({ where: { name } });
}

export async function getTemplate(id: string): Promise<TemplateData | null> {
  return prisma.emailTemplate.findUnique({ where: { id } });
}

export async function saveTemplate(
  data: { name: string; subject: string; body: string },
  id?: string
): Promise<TemplateData> {
  if (id) {
    return prisma.emailTemplate.update({ where: { id }, data });
  }
  return prisma.emailTemplate.create({ data });
}

export async function deleteTemplate(id: string): Promise<void> {
  await prisma.emailTemplate.delete({ where: { id } });
}

const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

const VARIABLE_LABELS: Record<string, string> = {
  employeeName: "Nombre completo del empleado",
  firstName: "Nombre (sin apellido)",
  birthDate: "Fecha de cumpleaños (ej: 15 de marzo)",
  age: "Edad que cumple",
  department: "Departamento del empleado",
  currentYear: "Año actual (ej: 2026)",
  companyName: "Nombre de la empresa",
};

export function getAvailableVariables(): { key: string; label: string }[] {
  return Object.entries(VARIABLE_LABELS).map(([key, label]) => ({ key, label }));
}

export function renderTemplate(
  template: { subject: string; body: string },
  vars: Record<string, string>
): { subject: string; body: string } {
  const replace = (text: string) =>
    text.replace(VARIABLE_REGEX, (_, key) => vars[key] ?? `{{${key}}}`);
  return { subject: replace(template.subject), body: replace(template.body) };
}
