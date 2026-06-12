# Employee Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir creación de empleados, agregar gestión de departamentos (CRUD), habilitar edición completa del legajo, e implementar subida real de documentos a disco.

**Architecture:** El modelo `Department` reemplaza el campo `department String` de `Employee` con una FK. Las queries del lib aplanan la relación a string para compatibilidad con los componentes existentes. La página `/settings` gestiona departamentos. `EmployeeProfileView` agrega un modo edición que llama al endpoint `PUT /api/employees/[id]` existente. Los documentos se guardan en `/uploads/{employeeId}/` con un endpoint autenticado para servirlos.

**Tech Stack:** Next.js 14 App Router, Prisma 5.x, PostgreSQL, Tailwind CSS, Framer Motion, Vitest, Node.js `fs/promises`.

---

## Mapa de archivos

**Crear:**
- `lib/departments.ts`
- `app/api/departments/route.ts`
- `app/api/departments/[id]/route.ts`
- `app/(dashboard)/settings/page.tsx`
- `components/SettingsView.tsx`
- `app/api/employees/[id]/documents/route.ts`
- `app/api/employees/[id]/documents/[docId]/route.ts`
- `app/api/uploads/[...path]/route.ts`
- `tests/departments.test.ts`

**Modificar:**
- `prisma/schema.prisma`
- `lib/employees.ts`
- `lib/requests.ts`
- `types/index.ts`
- `components/PersonalListView.tsx`
- `components/EmployeeProfileView.tsx`
- `components/Sidebar.tsx`
- `app/(dashboard)/layout.tsx`
- `app/api/employees/route.ts`
- `app/(dashboard)/personal/[id]/page.tsx`
- `docker-compose.yml`

---

## Task 1: Fix bug de creación de empleados

**Files:**
- Modify: `components/PersonalListView.tsx:88-113`
- Modify: `app/api/employees/route.ts`

- [ ] **Step 1: Corregir fechas y eliminar campos calculados en PersonalListView.tsx**

Reemplazar el bloque `newRecord` (líneas 88-113) con:

```tsx
const newRecord = {
  id: customId,
  firstName: newFirstName.trim(),
  lastName: newLastName.trim(),
  department: newDept,
  role: newRole.trim(),
  status: "ACTIVO" as const,
  hireDate: new Date().toISOString().split("T")[0],
  cuil: newCuil || "20-00000000-0",
  email: newEmail || `${newFirstName.toLowerCase().trim()}.${newLastName.toLowerCase().trim()}@precisionhr.com`,
  phone: newPhone || "+54 11 0000-0000",
  birthDate: "1990-01-01",
  maritalStatus: "Soltero",
  address: "Av. Corrientes 1000, CABA",
  emergencyContact: {
    name: "Contacto",
    relationship: "Familiar",
    phone: "+54 11 0000-0000",
  },
};
```

- [ ] **Step 2: Filtrar campos calculados en el API route**

En `app/api/employees/route.ts`, reemplazar el handler `POST` completo:

```ts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    workedDaysThisMonth,
    totalDaysThisMonth,
    totalFiles,
    vigenteFiles,
    vencidosFiles,
    rechazadosFiles,
    ...cleanBody
  } = body;

  try {
    const employee = await createEmployee({
      ...cleanBody,
      hireDate: new Date(cleanBody.hireDate),
      birthDate: new Date(cleanBody.birthDate),
    });
    return Response.json({ data: employee }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Error creating employee" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verificar en el navegador**

Abrir la lista de personal, hacer clic en "Agregar empleado", completar nombre/rol/depto, y confirmar. El servidor no debe mostrar error de Prisma.

- [ ] **Step 4: Commit**

```bash
git add components/PersonalListView.tsx app/api/employees/route.ts
git commit -m "fix: corregir fechas ISO y filtrar campos calculados al crear empleado"
```

---

## Task 2: Agregar modelo Department a Prisma

**Files:**
- Modify: `prisma/schema.prisma`
- Create: migración SQL con backfill de datos

- [ ] **Step 1: Actualizar prisma/schema.prisma**

Reemplazar el modelo `Employee` y agregar `Department`:

```prisma
model Department {
  id        String     @id @default(cuid())
  name      String     @unique
  active    Boolean    @default(true)
  employees Employee[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Employee {
  id               String         @id
  firstName        String
  lastName         String
  department       Department     @relation(fields: [departmentId], references: [id])
  departmentId     String
  role             String
  status           EmployeeStatus @default(ACTIVO)
  hireDate         DateTime
  exitDate         DateTime?
  email            String         @unique
  phone            String
  cuil             String         @unique
  birthDate        DateTime
  maritalStatus    String
  address          String
  emergencyContact Json
  leaveRequests    LeaveRequest[]
  documents        Document[]
  paySlips         PaySlip[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}
```

- [ ] **Step 2: Crear la migración sin aplicarla**

```bash
npx prisma migrate dev --create-only --name add_department_model
```

Esto crea el archivo en `prisma/migrations/XXXX_add_department_model/migration.sql`.

- [ ] **Step 3: Reemplazar el contenido del migration.sql generado**

Abrir el archivo generado y reemplazar todo su contenido con:

```sql
-- CreateTable Department
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- AddColumn nullable first (para no fallar con filas existentes)
ALTER TABLE "Employee" ADD COLUMN "departmentId" TEXT;

-- Poblar Department con los valores únicos existentes
INSERT INTO "Department" ("id", "name", "active", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::TEXT,
    department,
    true,
    NOW(),
    NOW()
FROM (SELECT DISTINCT department FROM "Employee" WHERE department IS NOT NULL AND department != '') AS d;

-- Backfill departmentId en Employee
UPDATE "Employee" e
SET "departmentId" = d.id
FROM "Department" d
WHERE e.department = d.name;

-- Si algún empleado no tiene departamento, asignar el primero disponible
UPDATE "Employee"
SET "departmentId" = (SELECT id FROM "Department" ORDER BY name LIMIT 1)
WHERE "departmentId" IS NULL;

-- Hacer NOT NULL
ALTER TABLE "Employee" ALTER COLUMN "departmentId" SET NOT NULL;

-- Eliminar la columna antigua
ALTER TABLE "Employee" DROP COLUMN "department";

-- FK constraint
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey"
    FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

- [ ] **Step 4: Aplicar la migración y regenerar cliente**

```bash
npx prisma migrate dev
npx prisma generate
```

Esperado: "1 migration applied" sin errores.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: agregar modelo Department con migración y backfill de datos"
```

---

## Task 3: Lib de departamentos + tests

**Files:**
- Create: `lib/departments.ts`
- Create: `tests/departments.test.ts`

- [ ] **Step 1: Escribir el test fallido**

Crear `tests/departments.test.ts`:

```ts
import { describe, test, expect } from "vitest";
import { getDepartments, createDepartment, updateDepartment, deactivateDepartment } from "@/lib/departments";

describe("getDepartments", () => {
  test("exporta una función", () => {
    expect(typeof getDepartments).toBe("function");
  });
});

describe("createDepartment", () => {
  test("exporta una función", () => {
    expect(typeof createDepartment).toBe("function");
  });
});

describe("updateDepartment", () => {
  test("exporta una función", () => {
    expect(typeof updateDepartment).toBe("function");
  });
});

describe("deactivateDepartment", () => {
  test("exporta una función", () => {
    expect(typeof deactivateDepartment).toBe("function");
  });
});
```

- [ ] **Step 2: Correr tests y verificar que fallan**

```bash
npx vitest run tests/departments.test.ts
```

Esperado: FAIL — "Cannot find module '@/lib/departments'"

- [ ] **Step 3: Crear lib/departments.ts**

```ts
import { prisma } from "./db";

export async function getDepartments(activeOnly = false) {
  return prisma.department.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function createDepartment(name: string) {
  return prisma.department.create({ data: { name } });
}

export async function updateDepartment(id: string, data: { name?: string; active?: boolean }) {
  return prisma.department.update({ where: { id }, data });
}

export async function deactivateDepartment(id: string) {
  const activeCount = await prisma.employee.count({
    where: { departmentId: id, status: "ACTIVO" },
  });
  if (activeCount > 0) {
    throw new Error(
      `No se puede dar de baja: hay ${activeCount} empleado(s) activo(s) en este departamento.`
    );
  }
  return prisma.department.update({ where: { id }, data: { active: false } });
}
```

- [ ] **Step 4: Correr tests y verificar que pasan**

```bash
npx vitest run tests/departments.test.ts
```

Esperado: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/departments.ts tests/departments.test.ts
git commit -m "feat: agregar lib de departamentos con tests"
```

---

## Task 4: API routes de departamentos

**Files:**
- Create: `app/api/departments/route.ts`
- Create: `app/api/departments/[id]/route.ts`

- [ ] **Step 1: Crear app/api/departments/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDepartments, createDepartment } from "@/lib/departments";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "true";
  const data = await getDepartments(activeOnly);
  return Response.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.name?.trim()) {
    return Response.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  try {
    const data = await createDepartment(body.name.trim());
    return Response.json({ data }, { status: 201 });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json({ error: "Ya existe un departamento con ese nombre" }, { status: 409 });
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Crear app/api/departments/[id]/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateDepartment, deactivateDepartment } from "@/lib/departments";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.active === false) {
      const data = await deactivateDepartment(params.id);
      return Response.json({ data });
    }
    const data = await updateDepartment(params.id, { name: body.name, active: body.active });
    return Response.json({ data });
  } catch (err: any) {
    const status = err.message?.includes("empleado") ? 409 : 500;
    return Response.json({ error: err.message }, { status });
  }
}
```

- [ ] **Step 3: Verificar con curl (servidor corriendo)**

```bash
curl -s http://localhost:3000/api/departments | jq .
```

Esperado: `{ "data": [ { "id": "...", "name": "IT & Desarrollo", "active": true, ... } ] }` (con los departamentos del backfill)

- [ ] **Step 4: Commit**

```bash
git add app/api/departments/
git commit -m "feat: agregar API routes de departamentos (GET/POST/PUT)"
```

---

## Task 5: Actualizar lib de empleados para la relación Department

**Files:**
- Modify: `lib/employees.ts`
- Modify: `lib/requests.ts`
- Modify: `types/index.ts`
- Modify: `app/(dashboard)/personal/[id]/page.tsx`

- [ ] **Step 1: Actualizar lib/employees.ts**

Reemplazar el archivo completo:

```ts
import { prisma } from "./db";
import { Prisma } from "@prisma/client";

const CATEGORY_LABELS: Record<string, string> = {
  IDENTIDAD: "Identidad",
  ACADEMICO: "Académico",
  CONTRACTUAL: "Contractual",
  MEDICO: "Médico",
  LEGALES: "Legales",
};

const STATUS_LABELS: Record<string, string> = {
  VIGENTE: "VIGENTE",
  POR_VENCER: "POR VENCER",
  EXPIRADO: "EXPIRADO",
  RECHAZADO: "RECHAZADO",
};

function computeDocStats(documents: { status: string }[]) {
  return {
    totalFiles: documents.length,
    vigenteFiles: documents.filter((d) => d.status === "VIGENTE").length,
    vencidosFiles: documents.filter(
      (d) => d.status === "EXPIRADO" || d.status === "POR_VENCER"
    ).length,
    rechazadosFiles: documents.filter((d) => d.status === "RECHAZADO").length,
  };
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export async function getEmployees() {
  const employees = await prisma.employee.findMany({
    orderBy: [{ status: "asc" }, { lastName: "asc" }],
    include: {
      documents: { select: { status: true } },
      department: { select: { id: true, name: true } },
    },
  });

  return employees.map(({ department, documents, hireDate, exitDate, birthDate, createdAt, updatedAt, ...rest }) => ({
    ...rest,
    department: department.name,
    departmentId: department.id,
    hireDate: formatDate(hireDate),
    exitDate: exitDate ? formatDate(exitDate) : undefined,
    birthDate: formatDate(birthDate),
    ...computeDocStats(documents),
    workedDaysThisMonth: 0,
    totalDaysThisMonth: 22,
  }));
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true } },
      leaveRequests: { orderBy: { submissionDate: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      paySlips: { orderBy: { generatedDate: "desc" } },
    },
  });
  if (!employee) return null;

  const { department, documents, leaveRequests, paySlips, hireDate, exitDate, birthDate, createdAt, updatedAt, ...rest } = employee;

  return {
    ...rest,
    department: department.name,
    departmentId: department.id,
    hireDate: formatDate(hireDate),
    exitDate: exitDate ? formatDate(exitDate) : undefined,
    birthDate: formatDate(birthDate),
    ...computeDocStats(documents),
    documents: documents.map((d) => ({
      id: d.id,
      name: d.name,
      fileName: d.fileName,
      category: (CATEGORY_LABELS[d.category] ?? d.category) as any,
      status: (STATUS_LABELS[d.status] ?? d.status) as any,
      expiryDate: d.expiryDate ? formatDate(d.expiryDate) : undefined,
      updatedDate: formatDate(d.updatedAt),
      rejectReason: d.rejectReason ?? undefined,
    })),
    workedDaysThisMonth: 0,
    totalDaysThisMonth: 22,
  };
}

export async function createEmployee(data: any) {
  try {
    return await prisma.employee.create({
      data: {
        ...data,
        emergencyContact: data.emergencyContact as any,
      },
    });
  } catch (err) {
    throw err;
  }
}

export async function updateEmployee(id: string, data: any) {
  try {
    const { department, workedDaysThisMonth, totalDaysThisMonth, totalFiles, vigenteFiles, vencidosFiles, rechazadosFiles, documents, ...clean } = data;
    return await prisma.employee.update({
      where: { id },
      data: {
        ...clean,
        hireDate: clean.hireDate ? new Date(clean.hireDate) : undefined,
        exitDate: clean.exitDate ? new Date(clean.exitDate) : undefined,
        birthDate: clean.birthDate ? new Date(clean.birthDate) : undefined,
        emergencyContact: clean.emergencyContact ? (clean.emergencyContact as any) : undefined,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return null;
    }
    throw err;
  }
}
```

- [ ] **Step 2: Actualizar lib/requests.ts para usar employee.department.name**

El campo `department` en `getRequests` ya se obtiene del `include`. Verificar que la línea 20 sigue siendo:

```ts
department: r.employee.department,
```

Después de la migración, `r.employee.department` es el objeto `Department`, no el string. Cambiar esa línea a:

```ts
department: r.employee.department.name,
```

- [ ] **Step 3: Actualizar types/index.ts — agregar departmentId y DocumentRecord**

En la interfaz `Employee`, agregar `departmentId` después de `department`:

```ts
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  departmentId: string;         // ← agregar
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
  documents?: DocumentRecord[];  // ← agregar
}

// Agregar nueva interfaz Department
export interface Department {
  id: string;
  name: string;
  active: boolean;
}
```

- [ ] **Step 4: Corregir URL equivocada en personal/[id]/page.tsx**

En `app/(dashboard)/personal/[id]/page.tsx`, línea 23, cambiar:

```ts
fetch("/api/leave-requests"),
```

por:

```ts
fetch("/api/requests"),
```

- [ ] **Step 5: Correr tests existentes**

```bash
npx vitest run
```

Esperado: todos los tests pasan.

- [ ] **Step 6: Commit**

```bash
git add lib/employees.ts lib/requests.ts types/index.ts app/(dashboard)/personal/[id]/page.tsx
git commit -m "feat: actualizar lib de empleados para relación Department y formatear fechas"
```

---

## Task 6: Página de Configuración — Gestión de Departamentos

**Files:**
- Modify: `app/(dashboard)/layout.tsx`
- Modify: `components/Sidebar.tsx`
- Create: `app/(dashboard)/settings/page.tsx`
- Create: `components/SettingsView.tsx`

- [ ] **Step 1: Actualizar layout.tsx — agregar settings al routing**

En `app/(dashboard)/layout.tsx`, actualizar los dos mapeos:

```ts
const PATH_TO_VIEW: Record<string, string> = {
  "/": "dashboard",
  "/personal": "personal",
  "/requests": "requests",
  "/reports": "reports",
  "/settings": "settings",
};

const VIEW_TO_PATH: Record<string, string> = {
  dashboard: "/",
  personal: "/personal",
  requests: "/requests",
  reports: "/reports",
  settings: "/settings",
};
```

- [ ] **Step 2: Agregar botón Settings al Sidebar**

En `components/Sidebar.tsx`, dentro del `<nav>` (después del botón de Reportes, línea 94), agregar:

```tsx
<button
  onClick={() => onViewChange("settings")}
  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
    currentView === "settings"
      ? "bg-indigo-600 text-white border-indigo-500/30 font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]"
      : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-white"
  }`}
>
  <Settings className="w-4 h-4" />
  <span>Configuración</span>
</button>
```

(El ícono `Settings` ya está importado en línea 13.)

- [ ] **Step 3: Crear app/(dashboard)/settings/page.tsx**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import SettingsView from "@/components/SettingsView";
import type { Department } from "@/types";

export default function SettingsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments");
      const { data } = await res.json();
      setDepartments(data ?? []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleCreate = async (name: string) => {
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }
    await fetchDepartments();
  };

  const handleUpdate = async (id: string, name: string) => {
    const res = await fetch(`/api/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }
    await fetchDepartments();
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    const res = await fetch(`/api/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      alert(error);
      return;
    }
    await fetchDepartments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <SettingsView
      departments={departments}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onToggleActive={handleToggleActive}
    />
  );
}
```

- [ ] **Step 4: Crear components/SettingsView.tsx**

```tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Check, X, Building2 } from "lucide-react";
import type { Department } from "@/types";

interface SettingsViewProps {
  departments: Department[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
}

export default function SettingsView({ departments, onCreate, onUpdate, onToggleActive }: SettingsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await onCreate(newName.trim());
      setNewName("");
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setEditingName(dept.name);
  };

  const handleEditSave = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await onUpdate(id, editingName.trim());
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white">Configuración</h1>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de departamentos y catálogos</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold text-white">Departamentos</h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-950 text-left text-[10px] font-bold text-slate-400 uppercase">
                <th className="px-4 py-2.5">Nombre</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-900/30 transition-colors text-xs">
                  <td className="px-4 py-3.5">
                    {editingId === dept.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs w-48 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-slate-200">{dept.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                        dept.active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-700/20 text-slate-500 border-slate-700/30"
                      }`}
                    >
                      {dept.active ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      {editingId === dept.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(dept.id)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg cursor-pointer transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(dept)}
                            className="p-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onToggleActive(dept.id, !dept.active)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              dept.active
                                ? "bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/20"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {dept.active ? "Dar de baja" : "Reactivar"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear departamento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6"
            >
              <h3 className="text-sm font-bold text-white mb-4">Nuevo Departamento</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre del departamento"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setNewName(""); }}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer transition-all disabled:opacity-50"
                  >
                    {creating ? "Creando..." : "Crear"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 5: Verificar en el navegador**

Navegar a `/settings`. Debe mostrar la tabla de departamentos. Crear uno nuevo, editar nombre, dar de baja.

- [ ] **Step 6: Commit**

```bash
git add app/(dashboard)/layout.tsx components/Sidebar.tsx app/(dashboard)/settings/ components/SettingsView.tsx
git commit -m "feat: agregar página de Configuración con gestión de departamentos"
```

---

## Task 7: Edición del Legajo

**Files:**
- Modify: `app/(dashboard)/personal/[id]/page.tsx`
- Modify: `components/EmployeeProfileView.tsx`

- [ ] **Step 1: Agregar handler de update y fetch de departments en personal/[id]/page.tsx**

Reemplazar el archivo completo:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import EmployeeProfileView from "@/components/EmployeeProfileView";
import type { Employee, LeaveRequest, Department } from "@/types";

export default function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allLeaveRequests, setAllLeaveRequests] = useState<LeaveRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [empRes, leavesRes, deptRes] = await Promise.all([
        fetch(`/api/employees/${params.id}`),
        fetch("/api/requests"),
        fetch("/api/departments?active=true"),
      ]);
      const { data: empData } = await empRes.json();
      const { data: leavesData } = await leavesRes.json();
      const { data: deptData } = await deptRes.json();
      setEmployee(empData);
      setAllLeaveRequests(leavesData ?? []);
      setDepartments(deptData ?? []);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEmployeeUpdate = async (data: Partial<Employee>) => {
    const res = await fetch(`/api/employees/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Error al guardar");
    }
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Empleado no encontrado.
      </div>
    );
  }

  return (
    <EmployeeProfileView
      employee={employee}
      onBackClick={() => router.push("/personal")}
      allLeaveRequests={allLeaveRequests}
      departments={departments}
      onEmployeeUpdate={handleEmployeeUpdate}
    />
  );
}
```

- [ ] **Step 2: Agregar props y estado de edición en EmployeeProfileView.tsx**

Actualizar la interfaz de props (líneas 47-51):

```tsx
interface EmployeeProfileViewProps {
  employee: Employee;
  onBackClick: () => void;
  allLeaveRequests: LeaveRequest[];
  departments: Department[];
  onEmployeeUpdate?: (data: Partial<Employee>) => Promise<void>;
}
```

Agregar el import de `Department` en el bloque de imports de `@/types` (línea 29):

```tsx
import {
  Employee,
  DocumentRecord,
  PaySlip,
  VersionHistoryRecord,
  LeaveRequest,
  RequestState,
  Department,
} from "@/types";
```

- [ ] **Step 3: Agregar estados de edición justo después de los estados existentes (línea 79)**

Después de `const [isSigningInProcess, setIsSigningInProcess] = useState(false);`, agregar:

```tsx
const [editing, setEditing] = useState(false);
const [saving, setSaving] = useState(false);
const [formData, setFormData] = useState({
  firstName: employee.firstName,
  lastName: employee.lastName,
  cuil: employee.cuil,
  email: employee.email,
  phone: employee.phone,
  birthDate: employee.birthDate,
  maritalStatus: employee.maritalStatus,
  address: employee.address,
  emergencyContact: { ...employee.emergencyContact },
  role: employee.role,
  departmentId: employee.departmentId,
  hireDate: employee.hireDate,
  exitDate: employee.exitDate ?? "",
  status: employee.status,
});

const handleSave = async () => {
  if (!onEmployeeUpdate) return;
  setSaving(true);
  try {
    await onEmployeeUpdate(formData);
    setEditing(false);
  } catch (err: any) {
    alert(err.message ?? "Error al guardar");
  } finally {
    setSaving(false);
};

const handleCancel = () => {
  setFormData({
    firstName: employee.firstName,
    lastName: employee.lastName,
    cuil: employee.cuil,
    email: employee.email,
    phone: employee.phone,
    birthDate: employee.birthDate,
    maritalStatus: employee.maritalStatus,
    address: employee.address,
    emergencyContact: { ...employee.emergencyContact },
    role: employee.role,
    departmentId: employee.departmentId,
    hireDate: employee.hireDate,
    exitDate: employee.exitDate ?? "",
    status: employee.status,
  });
  setEditing(false);
};
```

Nota: también agregar `departments` y `onEmployeeUpdate` a los parámetros del componente:

```tsx
export default function EmployeeProfileView({
  employee,
  onBackClick,
  allLeaveRequests,
  departments,
  onEmployeeUpdate,
}: EmployeeProfileViewProps) {
```

- [ ] **Step 4: Agregar botones Editar/Guardar/Cancelar en el header del perfil**

En la sección de botones del header (líneas 221-236), reemplazar el bloque `<div className="flex flex-row gap-2...">` con:

```tsx
<div className="flex flex-row gap-2 w-full md:w-auto self-stretch md:self-center">
  {editing ? (
    <>
      <button
        onClick={handleCancel}
        className="flex-1 md:flex-initial bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        Cancelar
      </button>
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => setEditing(true)}
        className="flex-1 md:flex-initial bg-slate-950 border border-slate-800 text-indigo-400 hover:bg-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        Editar perfil
      </button>
      <button
        onClick={handleDownloadFullZip}
        className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-505 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-indigo-500/20"
      >
        <Download className="w-3.5 h-3.5" />
        Descargar Legajo completo
      </button>
    </>
  )}
</div>
```

- [ ] **Step 5: Hacer editable la pestaña Personal (líneas 483-539)**

Reemplazar el contenido del panel `activeTab === "personal"` (el motion.div con className que tiene `grid grid-cols-1 md:grid-cols-2`) con:

```tsx
{activeTab === "personal" && (
  <motion.div
    key="personal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-all shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 font-sans text-xs"
  >
    {editing ? (
      <>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nombre</label>
          <input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Apellido</label>
          <input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CUIL / CUIT</label>
          <input value={formData.cuil} onChange={e => setFormData(p => ({ ...p, cuil: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fecha de Nacimiento</label>
          <input type="date" value={formData.birthDate} onChange={e => setFormData(p => ({ ...p, birthDate: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estado Civil</label>
          <input value={formData.maritalStatus} onChange={e => setFormData(p => ({ ...p, maritalStatus: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Domicilio</label>
          <input value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
          <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Teléfono</label>
          <input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
      </>
    ) : (
      <>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{employee.firstName} {employee.lastName}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CUIL / CUIT</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5 font-mono">{employee.cuil}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha de Nacimiento</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{employee.birthDate}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Civil</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{employee.maritalStatus}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domicilio Fiscal / Real</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{employee.address}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Personal</p>
          <p className="text-sm font-semibold text-indigo-400 mt-0.5 hover:underline cursor-pointer">{employee.email}</p>
        </div>
      </>
    )}
  </motion.div>
)}
```

- [ ] **Step 6: Hacer editable la pestaña Contacto (líneas 542-576)**

Reemplazar el contenido del panel `activeTab === "contacto"` con:

```tsx
{activeTab === "contacto" && (
  <motion.div
    key="contacto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-all shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-5 text-xs"
  >
    {editing ? (
      <>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nombre del Contacto</label>
          <input value={formData.emergencyContact.name}
            onChange={e => setFormData(p => ({ ...p, emergencyContact: { ...p.emergencyContact, name: e.target.value } }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Parentesco / Relación</label>
          <input value={formData.emergencyContact.relationship}
            onChange={e => setFormData(p => ({ ...p, emergencyContact: { ...p.emergencyContact, relationship: e.target.value } }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Teléfono de Urgencia</label>
          <input value={formData.emergencyContact.phone}
            onChange={e => setFormData(p => ({ ...p, emergencyContact: { ...p.emergencyContact, phone: e.target.value } }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-500" />
        </div>
      </>
    ) : (
      <>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre del Contacto</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{employee.emergencyContact.name}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parentesco / Relación</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{employee.emergencyContact.relationship}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono de Urgencia</p>
          <p className="text-sm font-semibold text-indigo-400 font-mono mt-0.5">{employee.emergencyContact.phone}</p>
        </div>
      </>
    )}
  </motion.div>
)}
```

- [ ] **Step 7: Hacer editable la pestaña Laboral (líneas 578-636)**

Reemplazar el contenido del panel `activeTab === "laboral"` con:

```tsx
{activeTab === "laboral" && (
  <motion.div
    key="laboral"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/60 transition-all shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs"
  >
    {editing ? (
      <>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Puesto Actual</label>
          <input value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Departamento</label>
          <select value={formData.departmentId} onChange={e => setFormData(p => ({ ...p, departmentId: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500">
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fecha de Contratación</label>
          <input type="date" value={formData.hireDate} onChange={e => setFormData(p => ({ ...p, hireDate: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fecha de Egreso</label>
          <input type="date" value={formData.exitDate} onChange={e => setFormData(p => ({ ...p, exitDate: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estado</label>
          <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as "ACTIVO" | "INACTIVO" }))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500">
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>
      </>
    ) : (
      <>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Puesto Actual</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{employee.role}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Área Operativa</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{employee.department}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha de Contratación</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{employee.hireDate}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supervisor Directo</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">Andrés Martínez (IT Director)</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Convenio Aplicable</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">CCT Empleados de Comercio / Fuera de Convenio</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evaluación de Desempeño</p>
          <p className="text-sm font-semibold text-emerald-400 mt-0.5">9.2 / 10 (Excelente)</p>
        </div>
      </>
    )}
  </motion.div>
)}
```

- [ ] **Step 8: Verificar en el navegador**

Abrir un legajo, hacer clic en "Editar perfil", cambiar un campo (ej. teléfono), guardar. Verificar que el cambio persiste recargando la página.

- [ ] **Step 9: Commit**

```bash
git add app/(dashboard)/personal/[id]/page.tsx components/EmployeeProfileView.tsx
git commit -m "feat: habilitar edición completa del legajo del empleado"
```

---

## Task 8: API de subida de documentos

**Files:**
- Modify: `docker-compose.yml`
- Create: `app/api/employees/[id]/documents/route.ts`
- Create: `app/api/employees/[id]/documents/[docId]/route.ts`
- Create: `app/api/uploads/[...path]/route.ts`

- [ ] **Step 1: Agregar volumen de uploads en docker-compose.yml**

Reemplazar el archivo completo:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env.local
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads:/app/uploads

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: precisionhr
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  uploads:
```

- [ ] **Step 2: Crear app/api/employees/[id]/documents/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const CATEGORY_MAP: Record<string, string> = {
  Identidad: "IDENTIDAD",
  Académico: "ACADEMICO",
  Contractual: "CONTRACTUAL",
  Médico: "MEDICO",
  Legales: "LEGALES",
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string | null;
  const categoryLabel = formData.get("category") as string | null;
  const expiryDateStr = formData.get("expiryDate") as string | null;

  if (!file || !name?.trim() || !categoryLabel) {
    return Response.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const category = CATEGORY_MAP[categoryLabel] ?? "IDENTIDAD";
  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = join(process.cwd(), "uploads", params.id);
  await mkdir(dir, { recursive: true });

  const fileId = crypto.randomUUID();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${fileId}-${safeFileName}`;
  await writeFile(join(dir, storedName), buffer);

  const doc = await prisma.document.create({
    data: {
      employeeId: params.id,
      name: name.trim(),
      fileName: `${params.id}/${storedName}`,
      category: category as any,
      status: "VIGENTE",
      expiryDate: expiryDateStr ? new Date(expiryDateStr) : undefined,
    },
  });

  return Response.json({
    data: {
      id: doc.id,
      name: doc.name,
      fileName: doc.fileName,
      category: categoryLabel,
      status: "VIGENTE",
      expiryDate: expiryDateStr ?? undefined,
      updatedDate: doc.createdAt.toISOString().slice(0, 10),
    },
  }, { status: 201 });
}
```

- [ ] **Step 3: Crear app/api/employees/[id]/documents/[docId]/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await prisma.document.findUnique({ where: { id: params.docId } });
  if (!doc || doc.employeeId !== params.id) {
    return Response.json({ error: "Documento no encontrado" }, { status: 404 });
  }

  try {
    await unlink(join(process.cwd(), "uploads", doc.fileName));
  } catch {
    // El archivo puede no existir en disco, continuar igual
  }

  await prisma.document.delete({ where: { id: params.docId } });
  return Response.json({ success: true });
}
```

- [ ] **Step 4: Crear app/api/uploads/[...path]/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const uploadsBase = join(process.cwd(), "uploads");
  const filePath = join(uploadsBase, ...params.path);

  // Prevenir path traversal
  if (!filePath.startsWith(uploadsBase + "/") && filePath !== uploadsBase) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const file = await readFile(filePath);
    const ext = params.path[params.path.length - 1].split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new Response(file, { headers: { "Content-Type": contentType } });
  } catch {
    return Response.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
```

- [ ] **Step 5: Verificar con curl (servidor corriendo, con sesión activa)**

Esto solo se puede verificar desde el navegador dado que necesita sesión NextAuth. Continuar al Task 9.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml app/api/employees/ app/api/uploads/
git commit -m "feat: API de subida, descarga y eliminación de documentos en disco"
```

---

## Task 9: UI de subida de documentos en EmployeeProfileView

**Files:**
- Modify: `components/EmployeeProfileView.tsx`

- [ ] **Step 1: Actualizar estado inicial de documentos para usar los del empleado**

Al inicio del componente, reemplazar la línea:

```tsx
const [documents, setDocuments] = useState<DocumentRecord[]>(
  employeeDocuments[employee.id] || []
);
```

por:

```tsx
const [documents, setDocuments] = useState<DocumentRecord[]>(
  employee.documents ?? []
);
```

Y eliminar las constantes mock al inicio del archivo (líneas 43-45):

```tsx
// Eliminar estas 3 líneas:
const employeeDocuments: Record<string, DocumentRecord[]> = {};
const paySlipsData: Record<string, PaySlip[]> = {};
const versionHistoryData: Record<string, VersionHistoryRecord[]> = {};
```

- [ ] **Step 2: Agregar estado del modal de subida**

Después de `const [isSigningInProcess, setIsSigningInProcess] = useState(false);`, agregar:

```tsx
const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
const [uploadDocName, setUploadDocName] = useState("");
const [uploadCategory, setUploadCategory] = useState("Contractual");
const [uploadExpiryDate, setUploadExpiryDate] = useState("");
const [uploadFile, setUploadFile] = useState<File | null>(null);
const [uploadingReal, setUploadingReal] = useState(false);
```

- [ ] **Step 3: Agregar handler de subida real**

Después de `handleDownloadFullZip`, agregar:

```tsx
const handleRealUpload = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!uploadFile || !uploadDocName.trim()) {
    alert("Completá el nombre y seleccioná un archivo.");
    return;
  }
  setUploadingReal(true);
  const form = new FormData();
  form.append("file", uploadFile);
  form.append("name", uploadDocName.trim());
  form.append("category", uploadCategory);
  if (uploadExpiryDate) form.append("expiryDate", uploadExpiryDate);

  try {
    const res = await fetch(`/api/employees/${employee.id}/documents`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }
    const { data } = await res.json();
    setDocuments((prev) => [data, ...prev]);
    setIsUploadModalOpen(false);
    setUploadDocName("");
    setUploadFile(null);
    setUploadExpiryDate("");
  } catch (err: any) {
    alert(err.message ?? "Error al subir el documento");
  } finally {
    setUploadingReal(false);
  }
};

const handleDeleteDocument = async (docId: string) => {
  if (!confirm("¿Eliminar este documento?")) return;
  const res = await fetch(`/api/employees/${employee.id}/documents/${docId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  } else {
    alert("Error al eliminar el documento");
  }
};
```

- [ ] **Step 4: Reemplazar el botón "Subir Documento" del header**

Buscar el botón con texto "Subir Documento" (línea ~223-228) y reemplazarlo:

```tsx
<button
  onClick={() => setIsUploadModalOpen(true)}
  className="flex-1 md:flex-initial bg-slate-950 border border-slate-800 text-indigo-400 hover:bg-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
>
  <UploadCloud className="w-3.5 h-3.5" />
  Subir Documento
</button>
```

- [ ] **Step 5: Reemplazar botones Ver/Descargar/Re-subir en la tabla de documentos**

En la columna de acciones de la tabla de documentos (líneas ~384-405), reemplazar el bloque de botones:

```tsx
<td className="px-4 py-2.5 text-right whitespace-nowrap">
  <div className="flex justify-end gap-1">
    <a
      href={`/api/uploads/${doc.fileName}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] font-bold text-indigo-400 hover:underline px-2 py-1 hover:bg-slate-800 rounded cursor-pointer"
    >
      Ver
    </a>
    <a
      href={`/api/uploads/${doc.fileName}`}
      download
      className="text-[10px] font-bold text-slate-300 hover:underline px-2 py-1 hover:bg-slate-800 rounded cursor-pointer"
    >
      Descargar
    </a>
    <button
      onClick={() => handleDeleteDocument(doc.id)}
      className="text-[10px] font-bold text-rose-400 hover:underline px-2 py-1 hover:bg-rose-950/20 rounded cursor-pointer"
    >
      Eliminar
    </button>
  </div>
</td>
```

- [ ] **Step 6: Agregar el modal de subida antes del modal de firma (al final del return, antes del cierre del motion.div)**

Antes de `{selectedPaySlipToSign && (`, agregar:

```tsx
{/* Modal de subida de documento */}
{isUploadModalOpen && (
  <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-indigo-400" />
          Subir Documento
        </h3>
        <button onClick={() => setIsUploadModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer">
          <XCircle className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <form onSubmit={handleRealUpload} className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre del documento *</label>
          <input
            value={uploadDocName}
            onChange={e => setUploadDocName(e.target.value)}
            placeholder="Ej: DNI Frente"
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Categoría *</label>
          <select
            value={uploadCategory}
            onChange={e => setUploadCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option>Identidad</option>
            <option>Académico</option>
            <option>Contractual</option>
            <option>Médico</option>
            <option>Legales</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha de vencimiento</label>
          <input
            type="date"
            value={uploadExpiryDate}
            onChange={e => setUploadExpiryDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Archivo *</label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:cursor-pointer"
            required
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(false)}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={uploadingReal}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer disabled:opacity-50"
          >
            {uploadingReal ? "Subiendo..." : "Subir"}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
)}
```

- [ ] **Step 7: Verificar en el navegador**

Abrir un legajo → pestaña Documentos → "Subir Documento". Seleccionar un PDF, completar el nombre, hacer clic en "Subir". Verificar que aparece en la tabla. Recargar la página — el documento debe seguir ahí.

- [ ] **Step 8: Commit**

```bash
git add components/EmployeeProfileView.tsx
git commit -m "feat: implementar subida real de documentos con modal y descarga autenticada"
```

---

## Task 10: Push a GitHub

- [ ] **Step 1: Verificar estado del repositorio**

```bash
git log --oneline -6
git status
```

- [ ] **Step 2: Push**

```bash
git push origin main
```

Esperado: todos los commits del plan subidos a `main` en GitHub.
