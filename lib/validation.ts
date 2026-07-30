import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)");

const emergencyContactObj = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
});

export const employeeCreateSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido").max(100),
  lastName: z.string().min(1, "Apellido requerido").max(100),
  email: z.string().email("Email inválido"),
  phone: z.string().max(50).optional().default(""),
  cuil: z.string().min(1, "CUIL requerido").max(20),
  birthDate: dateStr,
  maritalStatus: z.string().max(50).optional().default(""),
  address: z.string().max(200).optional().default(""),
  departmentId: z.string().min(1, "Departamento requerido"),
  role: z.string().max(100).optional().default(""),
  status: z.enum(["ACTIVO", "INACTIVO"]).optional().default("ACTIVO"),
  hireDate: dateStr,
  exitDate: dateStr.optional(),
  emergencyContact: emergencyContactObj.optional(),
});

export const employeeUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().max(50).optional(),
  cuil: z.string().min(1).max(20).optional(),
  birthDate: dateStr.optional(),
  maritalStatus: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
  departmentId: z.string().min(1).optional(),
  role: z.string().max(100).optional(),
  status: z.enum(["ACTIVO", "INACTIVO"]).optional(),
  hireDate: dateStr.optional(),
  exitDate: dateStr.optional().nullable(),
  emergencyContact: emergencyContactObj.optional(),
});

export const requestCreateSchema = z.object({
  employeeId: z.string().min(1),
  type: z.enum(["PARTICULAR", "ESTUDIO", "COMPENSATORIO", "ENFERMEDAD", "MEDICA", "MATERNIDAD", "AUSENCIA", "OTROS"]),
  startDate: dateStr,
  endDate: dateStr,
  days: z.number().int().positive(),
  observations: z.string().max(500).optional(),
  attachedFile: z.string().optional(),
});

export const requestStateSchema = z.object({
  state: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO", "PROCESADO"]),
});

export const departmentCreateSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100).transform(s => s.trim()),
});

export const departmentUpdateSchema = z.object({
  name: z.string().min(1).max(100).transform(s => s.trim()).optional(),
  active: z.boolean().optional(),
});

export const absenceTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  code: z.string().min(1).max(10),
  color: z.string().min(1),
});

export const absenceTypeArraySchema = z.array(absenceTypeSchema).min(1, "Debe haber al menos un tipo de ausencia");

export const birthdayMailSchema = z.object({
  employeeId: z.string().min(1, "employeeId requerido"),
});

const userRoleEnum = z.enum(["SUPERADMIN", "ADMIN", "OPERADOR"]);
const userStatusEnum = z.enum(["ACTIVO", "INACTIVO"]);

export const adminUserCreateSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().optional(),
});

export const adminUserUpdateSchema = z.object({
  id: z.string().min(1, "ID requerido"),
  role: userRoleEnum.optional(),
  status: userStatusEnum.optional(),
}).refine((d) => d.role || d.status, { message: "Debe enviar role o status" });

export const absenceBulkItemSchema = z.object({
  id: z.string().optional(),
  absenceTypeId: z.string().min(1),
  date: dateStr,
  notes: z.string().optional(),
});

export const absenceBulkSchema = z.array(absenceBulkItemSchema);

export const vacationCreateSchema = z.object({
  employeeId: z.string().min(1, "Empleado requerido"),
  year: z.number().int().min(2020).max(2100),
  totalDays: z.number().int().min(0),
  usedDays: z.number().int().min(0).optional(),
  pendingPrev: z.number().int().min(0).optional(),
  observations: z.string().optional(),
});

export const templateCreateSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  subject: z.string().min(1, "Asunto requerido").max(200),
  body: z.string().min(1, "Cuerpo requerido"),
});

export const templateUpdateSchema = z.object({
  subject: z.string().min(1, "Asunto requerido").max(200),
  body: z.string().min(1, "Cuerpo requerido"),
});

export const emailSendSchema = z.object({
  to: z.string().email("Email inválido"),
  date: dateStr.optional(),
});

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB
