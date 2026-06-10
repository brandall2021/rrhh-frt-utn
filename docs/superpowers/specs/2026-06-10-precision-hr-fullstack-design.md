# Precision HR — Diseño Full-Stack

**Fecha:** 2026-06-10
**Estado:** Aprobado

## Resumen

Migración del SPA React + Vite a una aplicación Next.js 14 full-stack con PostgreSQL (Prisma), autenticación Google OAuth (NextAuth v5) y deploy en Dokploy. Solo administradores autorizados tienen acceso. Una sola organización. Sin integración de IA en esta versión.

---

## 1. Arquitectura General

Stack: **Next.js 14 App Router + Prisma + PostgreSQL + NextAuth v5**

```
personal/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Pantalla de login con Google
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Layout protegido (admins autenticados)
│   │   ├── page.tsx                # Dashboard
│   │   ├── personal/page.tsx       # Lista de empleados
│   │   ├── personal/[id]/page.tsx  # Perfil de empleado
│   │   ├── requests/page.tsx       # Solicitudes / novedades
│   │   └── reports/page.tsx        # Reportes
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── employees/route.ts
│       ├── employees/[id]/route.ts
│       ├── requests/route.ts
│       ├── requests/[id]/route.ts
│       └── conflicts/route.ts
├── components/                     # Componentes React migrados desde src/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── lib/
│   ├── auth.ts                     # Configuración NextAuth
│   ├── db.ts                       # Cliente Prisma singleton
│   └── middleware.ts               # Protección de rutas
├── middleware.ts                   # Next.js middleware global
├── Dockerfile
└── docker-compose.yml
```

**Flujo de navegación:**
1. Usuario accede a cualquier ruta → middleware verifica sesión
2. Sin sesión → redirige a `/login`
3. Login con Google → NextAuth verifica email en tabla `AdminUser`
4. Email no autorizado → `/login?error=unauthorized`
5. Email autorizado → sesión creada, redirige a `/` (dashboard)

---

## 2. Modelo de Base de Datos

```prisma
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

**Nota:** Los conflictos se calculan dinámicamente en el servidor (endpoint `/api/conflicts`) comparando fechas de solicitudes pendientes/aprobadas del mismo departamento. No se persisten en BD.

**Seed:** El archivo `prisma/seed.ts` carga todos los datos de `data.ts` como punto de partida.

---

## 3. Autenticación

- **Provider:** Google OAuth 2.0 via NextAuth v5
- **Estrategia de autorización:** Al autenticar, el callback `signIn` verifica que `user.email` exista en la tabla `AdminUser`. Si no existe, retorna `false` (acceso denegado).
- **Sesión:** JWT strategy (sin tabla de sesiones en BD)
- **Middleware:** `middleware.ts` en raíz protege todas las rutas excepto `/login` y `/api/auth/*`

**Variables de entorno:**
```env
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://tudominio.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=postgresql://user:password@db:5432/precisionhr
```

**Agregar nuevos admins:** Insertar email directamente en tabla `AdminUser` vía Prisma Studio o script. No hay UI de gestión de admins en esta versión.

**Pantalla de login:** Página minimalista con logo Precision HR y botón "Ingresar con Google". Si `error=unauthorized`, muestra mensaje "Tu cuenta no tiene acceso autorizado".

---

## 4. API Routes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/employees` | Lista todos los empleados |
| POST | `/api/employees` | Crear empleado |
| GET | `/api/employees/[id]` | Detalle de empleado con documentos y recibos |
| PUT | `/api/employees/[id]` | Actualizar empleado |
| GET | `/api/requests` | Lista solicitudes (con filtros: estado, empleado) |
| POST | `/api/requests` | Crear solicitud |
| PUT | `/api/requests/[id]` | Aprobar / rechazar solicitud |
| GET | `/api/conflicts` | Calcular y retornar conflictos activos |

Todas las rutas verifican sesión activa antes de procesar. Responden con JSON estándar `{ data, error }`.

---

## 5. Deploy en Dokploy

**Dockerfile** (multi-stage):
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
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

**docker-compose.yml** (desarrollo local):
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

**Configuración en Dokploy:**
- Tipo: Application (desde GitHub)
- Build method: Dockerfile
- PostgreSQL: servicio separado en Dokploy (igual que prode-mundial-2026)
- Variables de entorno: cargadas desde el panel de Dokploy
- `next.config.ts` debe tener `output: 'standalone'` para la imagen Docker

---

## 6. Migración del Frontend Existente

Los componentes en `src/components/` se mueven a `components/` y se agregan como Client Components (`'use client'`) donde usan hooks React. El estado global que hoy vive en `App.tsx` pasa a ser fetches desde las API Routes usando `fetch` o `SWR`.

Archivos a eliminar: `src/data.ts` (reemplazado por BD), `vite.config.ts`, `index.html`. El `src/types.ts` se mantiene y se reutiliza.
