# Precision HR Full-Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar Precision HR de un SPA React+Vite con datos hardcodeados a una app Next.js 14 full-stack con PostgreSQL, autenticación Google OAuth y deploy en Dokploy.

**Architecture:** Next.js 14 App Router con route groups `(auth)` y `(dashboard)`. Los componentes React existentes se migran como Client Components. API Routes manejan el CRUD. La lógica de negocio se extrae a `lib/` para ser testeable con Vitest.

**Tech Stack:** Next.js 14, TypeScript, Prisma 5, PostgreSQL 16, NextAuth v4, Tailwind CSS v4, Vitest, Docker

---

## File Map

### Crear
```
next.config.ts
postcss.config.mjs
vitest.config.ts
middleware.ts
lib/db.ts
lib/auth.ts
lib/employees.ts
lib/requests.ts
lib/conflicts.ts
types/index.ts
components/Providers.tsx
components/LoginButton.tsx
components/Header.tsx
components/Sidebar.tsx
components/DashboardView.tsx
components/PersonalListView.tsx
components/EmployeeProfileView.tsx
components/NewRequestView.tsx
components/ReportsView.tsx
app/layout.tsx
app/globals.css
app/(auth)/login/page.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/page.tsx
app/(dashboard)/personal/page.tsx
app/(dashboard)/personal/[id]/page.tsx
app/(dashboard)/requests/page.tsx
app/(dashboard)/requests/new/page.tsx
app/(dashboard)/reports/page.tsx
app/api/auth/[...nextauth]/route.ts
app/api/employees/route.ts
app/api/employees/[id]/route.ts
app/api/requests/route.ts
app/api/requests/[id]/route.ts
app/api/conflicts/route.ts
prisma/schema.prisma
prisma/seed.ts
Dockerfile
docker-compose.yml
.env.local
tests/conflicts.test.ts
tests/requests.test.ts
```

### Modificar
```
package.json     - reemplazar deps de Vite por Next.js
tsconfig.json    - actualizar para Next.js
.gitignore       - agregar .next/
```

### Eliminar (en Task 13)
```
src/             - directorio completo
vite.config.ts
index.html
```

---

## Task 1: Reemplazar Vite con Next.js

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `.gitignore`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`

- [ ] **Step 1: Reemplazar package.json**

```json
{
  "name": "precision-hr",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "next": "^14.2.28",
    "next-auth": "^4.24.11",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^4.1.14"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.14",
    "@types/node": "^22.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^5.0.4",
    "jsdom": "^25.0.0",
    "prisma": "^5.22.0",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Instalar dependencias**

```bash
npm install
```

Salida esperada: `added N packages` sin errores.

- [ ] **Step 3: Crear next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 4: Reemplazar tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Crear postcss.config.mjs**

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 6: Crear vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 7: Actualizar .gitignore**

Agregar al .gitignore existente:
```
# Next.js
.next/
out/
.env.local
```

- [ ] **Step 8: Commit**

```bash
git add package.json tsconfig.json next.config.ts postcss.config.mjs vitest.config.ts .gitignore
git commit -m "chore: reemplazar Vite por Next.js 14"
```

---

## Task 2: Set up Prisma schema y migración

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env.local`

- [ ] **Step 1: Crear .env.local**

```env
# Base de datos (local con docker-compose)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/precisionhr"

# NextAuth
NEXTAUTH_SECRET="cambiar-por-secret-aleatorio-seguro"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (obtener desde Google Cloud Console)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

- [ ] **Step 2: Crear prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
}

model Employee {
  id               String         @id
  firstName        String
  lastName         String
  department       String
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

model LeaveRequest {
  id             String       @id @default(cuid())
  employee       Employee     @relation(fields: [employeeId], references: [id])
  employeeId     String
  type           NovedadType
  startDate      DateTime
  endDate        DateTime
  days           Int
  state          RequestState @default(PENDIENTE)
  observations   String?
  attachedFile   String?
  submissionDate DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model Document {
  id           String           @id @default(cuid())
  employee     Employee         @relation(fields: [employeeId], references: [id])
  employeeId   String
  name         String
  fileName     String
  category     DocumentCategory
  status       DocumentStatus
  expiryDate   DateTime?
  rejectReason String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

model PaySlip {
  id            String   @id @default(cuid())
  employee      Employee @relation(fields: [employeeId], references: [id])
  employeeId    String
  period        String
  generatedDate DateTime
  signed        Boolean  @default(false)
  createdAt     DateTime @default(now())
}

enum EmployeeStatus   { ACTIVO INACTIVO }
enum NovedadType      { PARTICULAR ESTUDIO COMPENSATORIO ENFERMEDAD MEDICA MATERNIDAD AUSENCIA OTROS }
enum RequestState     { PENDIENTE APROBADO RECHAZADO PROCESADO }
enum DocumentCategory { Identidad Academico Contractual Medico Legales }
enum DocumentStatus   { VIGENTE POR_VENCER EXPIRADO RECHAZADO }
```

- [ ] **Step 3: Levantar base de datos local (primero crear docker-compose.yml)**

Crear `docker-compose.yml` ahora para tener la BD disponible:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: precisionhr
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

Luego:
```bash
docker compose up -d db
```

Esperar a que el healthcheck pase: `docker compose ps` debe mostrar `healthy`.

- [ ] **Step 4: Ejecutar migración inicial**

```bash
npx prisma migrate dev --name init
```

Salida esperada: `✔ Generated Prisma Client` y `Your database is now in sync with your schema.`

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ docker-compose.yml .env.local
git commit -m "feat: agregar schema Prisma y migración inicial"
```

---

## Task 3: Configurar NextAuth y Middleware

**Files:**
- Create: `lib/db.ts`
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Crear lib/db.ts**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: Crear lib/auth.ts**

```ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const admin = await prisma.adminUser.findUnique({
        where: { email: user.email },
      });
      return !!admin;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
```

- [ ] **Step 3: Crear app/api/auth/[...nextauth]/route.ts**

```ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 4: Crear middleware.ts**

```ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

- [ ] **Step 5: Insertar primer admin en BD**

Reemplazar `tu@email.com` con el email de Google que se usará para ingresar:

```bash
npx prisma studio
```

En Prisma Studio → modelo `AdminUser` → Add record → ingresar email.

O bien via query directa:
```bash
npx prisma db execute --stdin <<EOF
INSERT INTO "AdminUser" (id, email, "createdAt") VALUES (gen_random_uuid(), 'tu@email.com', NOW());
EOF
```

- [ ] **Step 6: Commit**

```bash
git add lib/db.ts lib/auth.ts app/api/auth/ middleware.ts
git commit -m "feat: configurar NextAuth con Google OAuth y middleware de protección"
```

---

## Task 4: Login page y Root Layout

**Files:**
- Create: `components/Providers.tsx`
- Create: `components/LoginButton.tsx`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Crear components/Providers.tsx**

```tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 2: Crear app/globals.css**

Copiar el contenido de `src/index.css` tal cual:

```css
@import "tailwindcss";

/* Copiar todo el contenido de src/index.css aquí */
```

Ejecutar para obtener el contenido exacto:
```bash
cat src/index.css
```
Y pegar en `app/globals.css`.

- [ ] **Step 3: Crear app/layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Precision HR - Gestión de RRHH",
  description: "Sistema de control de asistencia y gestión de personal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Crear components/LoginButton.tsx**

```tsx
"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Ingresar con Google
    </button>
  );
}
```

- [ ] **Step 5: Crear app/(auth)/login/page.tsx**

```tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LoginButton from "@/components/LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  const isUnauthorized = searchParams.error === "AccessDenied";

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 p-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm max-w-sm w-full mx-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Precision HR
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sistema de Gestión de RRHH
          </p>
        </div>

        {isUnauthorized && (
          <div className="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
            Tu cuenta no tiene acceso autorizado.
            <br />
            Contactá al administrador del sistema.
          </div>
        )}

        <LoginButton />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/Providers.tsx components/LoginButton.tsx app/layout.tsx app/globals.css app/
git commit -m "feat: agregar login page con Google OAuth y root layout"
```

---

## Task 5: Migrar tipos y componentes

**Files:**
- Create: `types/index.ts`
- Create: `components/Header.tsx`
- Create: `components/Sidebar.tsx`
- Create: `components/DashboardView.tsx`
- Create: `components/PersonalListView.tsx`
- Create: `components/EmployeeProfileView.tsx`
- Create: `components/NewRequestView.tsx`
- Create: `components/ReportsView.tsx`

- [ ] **Step 1: Crear types/index.ts**

Copiar el contenido completo de `src/types.ts` a `types/index.ts` sin cambios. Ejecutar:
```bash
cp src/types.ts types/index.ts
```

- [ ] **Step 2: Migrar cada componente**

Para cada archivo en `src/components/`, ejecutar el patrón:

```bash
# Ejemplo para Header
cp src/components/Header.tsx components/Header.tsx
```

Luego editar `components/Header.tsx` para:
1. Agregar `"use client";` como primera línea (antes de los imports)
2. Cambiar `from "../types"` → `from "@/types"` (si existe ese import)
3. Cambiar `from "./types"` → `from "@/types"` (si existe ese import)

Aplicar a los 7 componentes:
- `Header.tsx`
- `Sidebar.tsx`
- `DashboardView.tsx`
- `PersonalListView.tsx`
- `EmployeeProfileView.tsx`
- `NewRequestView.tsx`
- `ReportsView.tsx`

Verificar que ninguno importe de `../data` o `./data` (no deben — solo App.tsx importaba de data.ts).

- [ ] **Step 3: Verificar que TypeScript compila**

```bash
npx tsc --noEmit
```

Esperado: sin errores (o solo errores de páginas aún no creadas).

- [ ] **Step 4: Commit**

```bash
git add types/ components/
git commit -m "feat: migrar tipos y componentes a estructura Next.js"
```

---

## Task 6: Dashboard Layout

**Files:**
- Create: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Crear app/(dashboard)/layout.tsx**

```tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const PATH_TO_VIEW: Record<string, string> = {
  "/": "dashboard",
  "/personal": "personal",
  "/requests": "requests",
  "/reports": "reports",
};

const VIEW_TO_PATH: Record<string, string> = {
  dashboard: "/",
  personal: "/personal",
  requests: "/requests",
  reports: "/reports",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const currentView = PATH_TO_VIEW[pathname] ?? "dashboard";

  const handleViewChange = (view: string) => {
    router.push(VIEW_TO_PATH[view] ?? "/");
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans select-none antialiased text-[#f1f5f9]">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        searchTerm=""
        onSearchChange={() => {}}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onNewRequestClick={() => router.push("/requests/new")}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/layout.tsx
git commit -m "feat: agregar dashboard layout con navegación"
```

---

## Task 7: Lógica de negocio y API de Employees (con tests)

**Files:**
- Create: `lib/employees.ts`
- Create: `app/api/employees/route.ts`
- Create: `app/api/employees/[id]/route.ts`

- [ ] **Step 1: Crear lib/employees.ts**

> **Nota:** Los campos `workedDaysThisMonth`, `totalDaysThisMonth`, `totalFiles`, `vigenteFiles`, `vencidosFiles`, `rechazadosFiles` existen en `types/index.ts` (usados por los componentes) pero NO están en el schema Prisma. Se calculan dinámicamente: los de documentos se cuentan desde la relación `documents`, los de asistencia se dejan en 0 como placeholder hasta implementar un módulo de asistencia.

```ts
import { prisma } from "./db";
import type { Employee, EmployeeStatus } from "@prisma/client";

export type CreateEmployeeInput = Omit<Employee, "createdAt" | "updatedAt">;

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

export async function getEmployees() {
  const employees = await prisma.employee.findMany({
    orderBy: [{ status: "asc" }, { lastName: "asc" }],
    include: { documents: { select: { status: true } } },
  });
  return employees.map((emp) => ({
    ...emp,
    ...computeDocStats(emp.documents),
    workedDaysThisMonth: 0,
    totalDaysThisMonth: 22,
  }));
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      leaveRequests: { orderBy: { submissionDate: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      paySlips: { orderBy: { generatedDate: "desc" } },
    },
  });
  if (!employee) return null;
  return {
    ...employee,
    ...computeDocStats(employee.documents),
    workedDaysThisMonth: 0,
    totalDaysThisMonth: 22,
  };
}

export async function createEmployee(data: CreateEmployeeInput) {
  return prisma.employee.create({ data });
}

export async function updateEmployee(
  id: string,
  data: Partial<CreateEmployeeInput>
) {
  return prisma.employee.update({ where: { id }, data });
}
```

- [ ] **Step 2: Crear app/api/employees/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEmployees, createEmployee } from "@/lib/employees";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getEmployees();
  return Response.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const employee = await createEmployee(body);
  return Response.json({ data: employee }, { status: 201 });
}
```

- [ ] **Step 3: Crear app/api/employees/[id]/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEmployeeById, updateEmployee } from "@/lib/employees";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const employee = await getEmployeeById(params.id);
  if (!employee) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ data: employee });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const employee = await updateEmployee(params.id, body);
  return Response.json({ data: employee });
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/employees.ts app/api/employees/
git commit -m "feat: agregar API routes y lógica de empleados"
```

---

## Task 8: Lógica de negocio y API de Requests (con tests)

**Files:**
- Create: `lib/requests.ts`
- Create: `app/api/requests/route.ts`
- Create: `app/api/requests/[id]/route.ts`
- Create: `tests/requests.test.ts`

- [ ] **Step 1: Crear lib/requests.ts**

```ts
import { prisma } from "./db";
import type { RequestState } from "@prisma/client";

export async function getRequests(filters?: { state?: RequestState; employeeId?: string }) {
  return prisma.leaveRequest.findMany({
    where: {
      ...(filters?.state && { state: filters.state }),
      ...(filters?.employeeId && { employeeId: filters.employeeId }),
    },
    include: {
      employee: { select: { firstName: true, lastName: true, department: true } },
    },
    orderBy: { submissionDate: "desc" },
  });
}

export async function createRequest(data: {
  employeeId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  days: number;
  observations?: string;
  attachedFile?: string;
}) {
  return prisma.leaveRequest.create({ data: data as any });
}

export const VALID_TRANSITIONS: Record<string, RequestState[]> = {
  PENDIENTE: ["APROBADO", "RECHAZADO"],
  APROBADO: ["PROCESADO"],
  RECHAZADO: [],
  PROCESADO: [],
};

export function canTransition(from: RequestState, to: RequestState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function updateRequestState(id: string, newState: RequestState) {
  const existing = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!existing) return null;
  if (!canTransition(existing.state, newState)) {
    throw new Error(`Transición inválida: ${existing.state} → ${newState}`);
  }
  return prisma.leaveRequest.update({ where: { id }, data: { state: newState } });
}
```

- [ ] **Step 2: Escribir tests para requests (primero)**

Crear `tests/requests.test.ts`:

```ts
import { describe, test, expect } from "vitest";
import { canTransition, VALID_TRANSITIONS } from "@/lib/requests";

describe("canTransition", () => {
  test("PENDIENTE puede pasar a APROBADO", () => {
    expect(canTransition("PENDIENTE", "APROBADO")).toBe(true);
  });

  test("PENDIENTE puede pasar a RECHAZADO", () => {
    expect(canTransition("PENDIENTE", "RECHAZADO")).toBe(true);
  });

  test("APROBADO puede pasar a PROCESADO", () => {
    expect(canTransition("APROBADO", "PROCESADO")).toBe(true);
  });

  test("RECHAZADO no puede pasar a APROBADO", () => {
    expect(canTransition("RECHAZADO", "APROBADO")).toBe(false);
  });

  test("PROCESADO no puede pasar a ningún estado", () => {
    expect(canTransition("PROCESADO", "APROBADO")).toBe(false);
    expect(canTransition("PROCESADO", "RECHAZADO")).toBe(false);
    expect(canTransition("PROCESADO", "PENDIENTE")).toBe(false);
  });

  test("PENDIENTE no puede pasar a PROCESADO directamente", () => {
    expect(canTransition("PENDIENTE", "PROCESADO")).toBe(false);
  });
});
```

- [ ] **Step 3: Ejecutar test (debe pasar)**

```bash
npm test tests/requests.test.ts
```

Esperado: todos los tests pasan.

- [ ] **Step 4: Crear app/api/requests/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRequests, createRequest } from "@/lib/requests";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") as any;
  const employeeId = searchParams.get("employeeId") ?? undefined;

  const data = await getRequests({ state: state ?? undefined, employeeId });
  return Response.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const req = await createRequest({
    ...body,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
  });
  return Response.json({ data: req }, { status: 201 });
}
```

- [ ] **Step 5: Crear app/api/requests/[id]/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateRequestState } from "@/lib/requests";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { state } = await request.json();
  try {
    const updated = await updateRequestState(params.id, state);
    if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ data: updated });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/requests.ts app/api/requests/ tests/requests.test.ts
git commit -m "feat: agregar API de solicitudes con validación de transiciones de estado"
```

---

## Task 9: Lógica de Conflictos y API (con tests)

**Files:**
- Create: `lib/conflicts.ts`
- Create: `app/api/conflicts/route.ts`
- Create: `tests/conflicts.test.ts`

- [ ] **Step 1: Crear tests/conflicts.test.ts (primero)**

```ts
import { describe, test, expect } from "vitest";
import { detectConflicts } from "@/lib/conflicts";

type TestRequest = Parameters<typeof detectConflicts>[0][0];

const req = (overrides: Partial<TestRequest> & Pick<TestRequest, "employeeId" | "department" | "startDate" | "endDate">): TestRequest => ({
  employeeName: "Empleado",
  type: "PARTICULAR",
  state: "PENDIENTE",
  ...overrides,
});

describe("detectConflicts", () => {
  test("retorna vacío sin solicitudes", () => {
    expect(detectConflicts([])).toEqual([]);
  });

  test("sin conflicto con una sola solicitud por departamento", () => {
    const result = detectConflicts([
      req({ employeeId: "1", department: "IT", startDate: new Date("2025-10-15"), endDate: new Date("2025-10-18") }),
    ]);
    expect(result).toHaveLength(0);
  });

  test("detecta superposición entre dos empleados del mismo departamento", () => {
    const result = detectConflicts([
      req({ employeeId: "1", employeeName: "Juan", department: "IT", startDate: new Date("2025-10-15"), endDate: new Date("2025-10-18") }),
      req({ employeeId: "2", employeeName: "María", department: "IT", state: "APROBADO", startDate: new Date("2025-10-16"), endDate: new Date("2025-10-20") }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].team).toBe("IT");
    expect(result[0].severity).toBe("WARNING");
  });

  test("no marca fechas no superpuestas", () => {
    const result = detectConflicts([
      req({ employeeId: "1", department: "IT", startDate: new Date("2025-10-01"), endDate: new Date("2025-10-05") }),
      req({ employeeId: "2", department: "IT", startDate: new Date("2025-10-06"), endDate: new Date("2025-10-10") }),
    ]);
    expect(result).toHaveLength(0);
  });

  test("CRITICAL para 3 o más empleados superpuestos", () => {
    const result = detectConflicts([
      req({ employeeId: "1", employeeName: "A", department: "Ventas", startDate: new Date("2025-10-15"), endDate: new Date("2025-10-20") }),
      req({ employeeId: "2", employeeName: "B", department: "Ventas", startDate: new Date("2025-10-16"), endDate: new Date("2025-10-18") }),
      req({ employeeId: "3", employeeName: "C", department: "Ventas", startDate: new Date("2025-10-17"), endDate: new Date("2025-10-22") }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe("CRITICAL");
  });

  test("ignora solicitudes RECHAZADO y PROCESADO", () => {
    const result = detectConflicts([
      req({ employeeId: "1", department: "IT", state: "RECHAZADO", startDate: new Date("2025-10-15"), endDate: new Date("2025-10-18") }),
      req({ employeeId: "2", department: "IT", state: "APROBADO", startDate: new Date("2025-10-16"), endDate: new Date("2025-10-20") }),
    ]);
    expect(result).toHaveLength(0);
  });

  test("no hay conflicto entre departamentos distintos", () => {
    const result = detectConflicts([
      req({ employeeId: "1", department: "IT", startDate: new Date("2025-10-15"), endDate: new Date("2025-10-20") }),
      req({ employeeId: "2", department: "Ventas", startDate: new Date("2025-10-16"), endDate: new Date("2025-10-18") }),
    ]);
    expect(result).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Ejecutar test (debe fallar con "Cannot find module")**

```bash
npm test tests/conflicts.test.ts
```

Esperado: FAIL con `Cannot find module '@/lib/conflicts'`

- [ ] **Step 3: Crear lib/conflicts.ts**

```ts
export type ConflictRequest = {
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: Date;
  endDate: Date;
  state: string;
};

export type ConflictResult = {
  id: string;
  team: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  description: string;
  statusText: string;
  relatedRequests: {
    employeeName: string;
    state: string;
    range: string;
    type: string;
  }[];
};

export function detectConflicts(requests: ConflictRequest[]): ConflictResult[] {
  const active = requests.filter(
    (r) => r.state === "PENDIENTE" || r.state === "APROBADO"
  );

  const byDept = new Map<string, ConflictRequest[]>();
  for (const r of active) {
    if (!byDept.has(r.department)) byDept.set(r.department, []);
    byDept.get(r.department)!.push(r);
  }

  const conflicts: ConflictResult[] = [];

  for (const [dept, deptReqs] of byDept.entries()) {
    if (deptReqs.length < 2) continue;

    const overlapping = new Set<ConflictRequest>();
    for (let i = 0; i < deptReqs.length; i++) {
      for (let j = i + 1; j < deptReqs.length; j++) {
        const a = deptReqs[i];
        const b = deptReqs[j];
        if (a.startDate <= b.endDate && b.startDate <= a.endDate) {
          overlapping.add(a);
          overlapping.add(b);
        }
      }
    }

    if (overlapping.size === 0) continue;

    const list = Array.from(overlapping);
    const severity = list.length >= 3 ? "CRITICAL" : "WARNING";

    conflicts.push({
      id: `CONF-${dept.replace(/\s+/g, "-").toUpperCase()}`,
      team: dept,
      severity,
      description: `${list.length} empleados de ${dept} tienen solicitudes superpuestas.`,
      statusText: `${list.length} solicitudes superpuestas`,
      relatedRequests: list.map((r) => ({
        employeeName: r.employeeName,
        state: r.state,
        range: `${r.startDate.toLocaleDateString("es-AR")} - ${r.endDate.toLocaleDateString("es-AR")}`,
        type: r.type,
      })),
    });
  }

  return conflicts;
}
```

- [ ] **Step 4: Ejecutar tests (deben pasar)**

```bash
npm test tests/conflicts.test.ts
```

Esperado: todos los tests pasan.

- [ ] **Step 5: Crear app/api/conflicts/route.ts**

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { detectConflicts } from "@/lib/conflicts";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.leaveRequest.findMany({
    where: { state: { in: ["PENDIENTE", "APROBADO"] } },
    include: {
      employee: { select: { firstName: true, lastName: true, department: true } },
    },
  });

  const formatted = requests.map((r) => ({
    employeeId: r.employeeId,
    employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
    department: r.employee.department,
    type: r.type,
    startDate: r.startDate,
    endDate: r.endDate,
    state: r.state,
  }));

  const conflicts = detectConflicts(formatted);
  return Response.json({ data: conflicts });
}
```

- [ ] **Step 6: Ejecutar todos los tests**

```bash
npm test
```

Esperado: todos los tests pasan.

- [ ] **Step 7: Commit**

```bash
git add lib/conflicts.ts app/api/conflicts/ tests/conflicts.test.ts tests/requests.test.ts
git commit -m "feat: agregar lógica de detección de conflictos con tests"
```

---

## Task 10: Dashboard Page

**Files:**
- Create: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Crear app/(dashboard)/page.tsx**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardView from "@/components/DashboardView";
import type { LeaveRequest } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [reqRes, confRes] = await Promise.all([
      fetch("/api/requests"),
      fetch("/api/conflicts"),
    ]);
    const { data: reqData } = await reqRes.json();
    const { data: confData } = await confRes.json();
    setRequests(reqData ?? []);
    setConflicts(confData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveRequest = async (id: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "APROBADO" }),
    });
    await fetchData();
  };

  const handleRejectRequest = async (id: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "RECHAZADO" }),
    });
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <DashboardView
      requests={requests}
      conflicts={conflicts}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      onNewRequestClick={() => router.push("/requests/new")}
      onEmployeeClick={(id) => router.push(`/personal/${id}`)}
    />
  );
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/page.tsx
git commit -m "feat: agregar dashboard page con data fetching desde API"
```

---

## Task 11: Personal Pages (Lista y Perfil)

**Files:**
- Create: `app/(dashboard)/personal/page.tsx`
- Create: `app/(dashboard)/personal/[id]/page.tsx`

- [ ] **Step 1: Crear app/(dashboard)/personal/page.tsx**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PersonalListView from "@/components/PersonalListView";
import type { Employee } from "@/types";

export default function PersonalPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    const res = await fetch("/api/employees");
    const { data } = await res.json();
    setEmployees(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = async (newEmp: Partial<Employee>) => {
    await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEmp),
    });
    await fetchEmployees();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <PersonalListView
      employees={employees}
      onEmployeeClick={(id) => router.push(`/personal/${id}`)}
      onAddEmployee={handleAddEmployee}
      searchTerm={searchTerm}
    />
  );
}
```

- [ ] **Step 2: Crear app/(dashboard)/personal/[id]/page.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeProfileView from "@/components/EmployeeProfileView";
import type { Employee, LeaveRequest } from "@/types";

export default function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<(Employee & { leaveRequests: LeaveRequest[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/employees/${params.id}`)
      .then((r) => r.json())
      .then(({ data }) => {
        setEmployee(data);
        setLoading(false);
      });
  }, [params.id]);

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
      allLeaveRequests={employee.leaveRequests ?? []}
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/personal/
git commit -m "feat: agregar páginas de lista y perfil de empleados"
```

---

## Task 12: Requests Pages

**Files:**
- Create: `app/(dashboard)/requests/page.tsx`
- Create: `app/(dashboard)/requests/new/page.tsx`

- [ ] **Step 1: Crear app/(dashboard)/requests/page.tsx**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardView from "@/components/DashboardView";
import type { LeaveRequest } from "@/types";

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [reqRes, confRes] = await Promise.all([
      fetch("/api/requests"),
      fetch("/api/conflicts"),
    ]);
    const { data: reqData } = await reqRes.json();
    const { data: confData } = await confRes.json();
    setRequests(reqData ?? []);
    setConflicts(confData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveRequest = async (id: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "APROBADO" }),
    });
    await fetchData();
  };

  const handleRejectRequest = async (id: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "RECHAZADO" }),
    });
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <DashboardView
      requests={requests}
      conflicts={conflicts}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      onNewRequestClick={() => router.push("/requests/new")}
      onEmployeeClick={(id) => router.push(`/personal/${id}`)}
    />
  );
}
```

- [ ] **Step 2: Crear app/(dashboard)/requests/new/page.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NewRequestView from "@/components/NewRequestView";
import type { Employee, LeaveRequest } from "@/types";

export default function NewRequestPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then(({ data }) => {
        setEmployees((data ?? []).filter((e: Employee) => e.status === "ACTIVO"));
        setLoading(false);
      });
  }, []);

  const handleSubmitRequest = async (newReq: Partial<LeaveRequest>) => {
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReq),
    });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <NewRequestView
      employees={employees}
      onBackClick={() => router.back()}
      onSubmitRequest={handleSubmitRequest}
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/requests/
git commit -m "feat: agregar páginas de solicitudes y nueva solicitud"
```

---

## Task 13: Reports Page, Seed y Limpieza

**Files:**
- Create: `app/(dashboard)/reports/page.tsx`
- Create: `prisma/seed.ts`
- Delete: `src/`, `vite.config.ts`, `index.html`

- [ ] **Step 1: Crear app/(dashboard)/reports/page.tsx**

```tsx
import ReportsView from "@/components/ReportsView";

export default function ReportsPage() {
  return <ReportsView />;
}
```

- [ ] **Step 2: Crear prisma/seed.ts**

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MONTHS: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function parseSpanishDate(dateStr: string): Date {
  // Soporta "02 de Enero, 2019" y "14 de Mayo, 1988 (36 años)"
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

  // Insertar admin por defecto — reemplazar con email real
  await prisma.adminUser.upsert({
    where: { email: "admin@precisionhr.com" },
    update: {},
    create: { email: "admin@precisionhr.com", name: "Admin" },
  });

  // Empleados del data.ts original
  const employees = [
    {
      id: "EMP-2941",
      firstName: "Rodrigo Hernán",
      lastName: "Silva",
      department: "IT & Desarrollo",
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
      department: "Operaciones",
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
      department: "Marketing",
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
      department: "IT Ops",
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
      department: "Ventas",
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

  // Solicitudes de ejemplo
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

  console.log("Seed completado.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: Agregar script de seed en package.json**

Verificar que `package.json` ya tiene:
```json
"db:seed": "tsx prisma/seed.ts"
```
Si no está, agregarlo en la sección `scripts`.

- [ ] **Step 4: Ejecutar seed (con BD corriendo)**

```bash
npm run db:seed
```

Esperado: `Seed completado.` sin errores.

- [ ] **Step 5: Eliminar archivos Vite**

```bash
rm -rf src/ vite.config.ts index.html
```

- [ ] **Step 6: Verificar compilación final**

```bash
npx tsc --noEmit
npm test
```

Esperado: sin errores TypeScript, todos los tests pasan.

- [ ] **Step 7: Commit**

```bash
git add app/\(dashboard\)/reports/ prisma/seed.ts
git rm -r src/ vite.config.ts index.html 2>/dev/null || true
git commit -m "feat: agregar reports page, seed inicial y eliminar archivos Vite"
```

---

## Task 14: Docker y configuración Dokploy

**Files:**
- Create: `Dockerfile`
- Modify: `docker-compose.yml` (agregar servicio `app`)

- [ ] **Step 1: Crear Dockerfile**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
RUN npm install -g prisma
EXPOSE 3000
CMD ["sh", "-c", "prisma migrate deploy && node server.js"]
```

- [ ] **Step 2: Actualizar docker-compose.yml (agregar servicio app)**

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

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: precisionhr
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

- [ ] **Step 3: Probar build Docker localmente**

```bash
docker compose build app
```

Esperado: build exitoso, imagen `personal-app` creada.

- [ ] **Step 4: Verificar que la imagen levanta**

```bash
docker compose up
```

Abrir `http://localhost:3000` — debe mostrar la pantalla de login.

- [ ] **Step 5: Instrucciones para Dokploy**

En el panel de Dokploy (`panel.softgroup.com.ar`):

1. **Crear servicio PostgreSQL** separado en Dokploy → anotar el `DATABASE_URL` interno
2. **Crear Application** → conectar con el repositorio GitHub `brandall2021/rrhh-frt-utn`
3. **Build method:** Dockerfile
4. **Variables de entorno** (cargar en el panel):
   ```
   DATABASE_URL=postgresql://...  (URL interna del servicio Postgres en Dokploy)
   NEXTAUTH_SECRET=<generado con: openssl rand -base64 32>
   NEXTAUTH_URL=https://tu-dominio.softgroup.com.ar
   GOOGLE_CLIENT_ID=<desde Google Cloud Console>
   GOOGLE_CLIENT_SECRET=<desde Google Cloud Console>
   ```
5. **En Google Cloud Console** → OAuth 2.0 → agregar `https://tu-dominio.softgroup.com.ar/api/auth/callback/google` como URI de redirección autorizado
6. **Deploy**

- [ ] **Step 6: Commit final**

```bash
git add Dockerfile docker-compose.yml
git commit -m "feat: agregar Dockerfile multi-stage y configuración docker-compose para Dokploy"
```

---

## Verificación Final

Después del Task 14, la app debe:
- [ ] Mostrar pantalla de login en `/login`
- [ ] Redirigir al login si no hay sesión activa
- [ ] Login con Google funciona (solo emails en tabla `AdminUser`)
- [ ] Dashboard muestra solicitudes y conflictos desde la BD
- [ ] Lista de empleados carga desde la BD
- [ ] Perfil de empleado muestra datos completos
- [ ] Nueva solicitud se guarda en la BD
- [ ] Aprobar/rechazar solicitudes persiste en BD
- [ ] `npm test` pasa todos los tests
- [ ] `docker compose build` exitoso
