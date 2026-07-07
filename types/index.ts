/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NovedadType, RequestState } from "@prisma/client";

export { NovedadType, RequestState };

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  departmentId: string;
  role: string;
  status: "ACTIVO" | "INACTIVO";
  hireDate: string;
  exitDate?: string;
  email: string;
  phone: string;
  cuil: string;
  birthDate: string;
  maritalStatus: string;
  address: string;
  photoUrl?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  workedDaysThisMonth: number;
  totalDaysThisMonth: number;
  totalFiles: number;
  vigenteFiles: number;
  vencidosFiles: number;
  rechazadosFiles: number;
  documents?: DocumentRecord[];
}

export interface Department {
  id: string;
  name: string;
  active: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: NovedadType;
  startDate: string;
  endDate: string;
  days: number;
  state: RequestState;
  observations?: string;
  attachedFile?: string;
  submissionDate: string;
}

export interface Conflict {
  id: string;
  team: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  description: string;
  statusText: string;
  relatedRequests: {
    employeeName: string;
    state: string;
    range: string;
    type: NovedadType;
  }[];
}

export interface MonthlyAbsenceStat {
  month: string; // "Ene", "Feb", etc.
  particular: number;
  enfermedad: number;
  compensatorio: number;
  estudio: number;
}

export interface DocumentRecord {
  id: string;
  name: string;
  fileName: string;
  category: "Identidad" | "Académico" | "Contractual" | "Médico" | "Legales";
  status: "VIGENTE" | "POR VENCER" | "EXPIRADO" | "RECHAZADO";
  expiryDate?: string;
  updatedDate: string;
  rejectReason?: string;
}

export interface VersionHistoryRecord {
  id: string;
  title: string;
  detail: string;
  date: string;
  archived?: boolean;
}

export interface AbsenceType {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface Absence {
  id: string;
  employeeId: string;
  absenceTypeId: string;
  date: string;
  notes?: string;
}
