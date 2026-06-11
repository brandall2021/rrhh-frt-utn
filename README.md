# Precision HR

Sistema de gestión de recursos humanos para administradores. Permite gestionar empleados, solicitudes de ausencias y detectar conflictos de cobertura por departamento.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Base de datos:** PostgreSQL 16 + Prisma ORM
- **Autenticación:** NextAuth v4 con Google OAuth
- **Estilos:** Tailwind CSS v4
- **Tests:** Vitest
- **Deploy:** Docker + Dokploy

## Requisitos previos

- Node.js 20+
- Docker y Docker Compose
- Cuenta de Google Cloud Console (para OAuth)

## Configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/brandall2021/rrhh-frt-utn.git
cd rrhh-frt-utn
npm install
```

### 2. Variables de entorno

Crear `.env` (usado por Prisma CLI):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/precisionhr"
```

Crear `.env.local` (usado por Next.js):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/precisionhr"
NEXTAUTH_SECRET="genera-uno-con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="obtenelo-en-google-cloud-console"
GOOGLE_CLIENT_SECRET="obtenelo-en-google-cloud-console"
```

### 3. Levantar la base de datos

```bash
docker compose up db -d
```

### 4. Aplicar migraciones y cargar datos iniciales

```bash
npx prisma migrate deploy
npm run db:seed
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Ejecutar tests |
| `npm run db:seed` | Cargar datos de ejemplo |
| `npx prisma studio` | Explorar la base de datos |
| `npx prisma migrate dev` | Crear nueva migración |

## Agregar un administrador

Los administradores se identifican por su email de Google. Para autorizar un nuevo email, insertarlo en la tabla `AdminUser`:

```bash
npx prisma studio
```

O directamente en SQL:

```sql
INSERT INTO "AdminUser" (id, email, name) VALUES (gen_random_uuid(), 'email@dominio.com', 'Nombre');
```

## Estructura del proyecto

```
app/
├── (auth)/login/          # Pantalla de login
├── (dashboard)/           # Páginas protegidas
│   ├── page.tsx           # Dashboard principal
│   ├── personal/          # Lista y perfil de empleados
│   ├── requests/          # Solicitudes y nueva solicitud
│   └── reports/           # Reportes y estadísticas
└── api/                   # API Routes
    ├── auth/[...nextauth]/ # NextAuth handler
    ├── employees/          # CRUD empleados
    ├── requests/           # CRUD solicitudes
    └── conflicts/          # Detección de conflictos

components/                # Componentes React (client components)
lib/                       # Lógica de negocio
├── auth.ts                # Configuración NextAuth
├── db.ts                  # Cliente Prisma singleton
├── employees.ts           # Lógica de empleados
├── requests.ts            # Lógica de solicitudes + máquina de estados
└── conflicts.ts           # Detección de conflictos por departamento
prisma/
├── schema.prisma          # Modelos de datos
└── seed.ts                # Datos iniciales
```

## Deploy en Dokploy

### 1. Crear servicio PostgreSQL en Dokploy

En el panel de Dokploy, crear un servicio PostgreSQL y anotar la `DATABASE_URL` interna.

### 2. Crear Application

- **Repositorio:** `brandall2021/rrhh-frt-utn`
- **Branch:** `main`
- **Build method:** Dockerfile

### 3. Variables de entorno en Dokploy

```env
DATABASE_URL=postgresql://user:password@db-host:5432/precisionhr
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://tu-dominio.softgroup.com.ar
GOOGLE_CLIENT_ID=<desde Google Cloud Console>
GOOGLE_CLIENT_SECRET=<desde Google Cloud Console>
```

### 4. Google Cloud Console

En **APIs & Services → Credentials → OAuth 2.0 Client**, agregar como URI de redirección autorizado:

```
https://tu-dominio.softgroup.com.ar/api/auth/callback/google
```

### 5. Primer deploy

Dokploy ejecuta automáticamente `prisma migrate deploy` al iniciar el contenedor. Luego correr el seed manualmente desde la consola del contenedor:

```bash
npm run db:seed
```

## Tests

```bash
npm test
```

13 tests automatizados:
- `tests/requests.test.ts` — Máquina de estados de solicitudes (6 tests)
- `tests/conflicts.test.ts` — Detección de conflictos por departamento (7 tests)
