# Employee Management — Design Spec
**Date:** 2026-06-12  
**Status:** Approved

---

## Scope

Four areas of work:
1. Fix employee creation bug (invalid date format)
2. Department management (create, edit, deactivate)
3. Legajo editing (all profile fields)
4. Document upload to local disk

---

## 1. Bug Fix — Employee Creation

**Problem:** `PersonalListView.tsx` hardcodes `hireDate: "10 de Junio, 2026"` and `birthDate: "01 de Enero, 1990"` as Spanish locale strings. Prisma requires ISO-8601.

**Fix:**
- Replace hardcoded dates with `new Date().toISOString().split("T")[0]` for `hireDate`
- Use `"1990-01-01"` as default for `birthDate`
- Strip computed fields (`workedDaysThisMonth`, `totalDaysThisMonth`, `totalFiles`, `vigenteFiles`, `vencidosFiles`, `rechazadosFiles`) from POST payload — these are not DB columns
- `POST /api/employees` must filter those fields before passing to Prisma

**Form fields (short form, unchanged):** firstName, lastName, role, department (from DB), cuil, email, phone.

---

## 2. Department Management

### Data Model

New `Department` model in Prisma:

```prisma
model Department {
  id        String     @id @default(cuid())
  name      String     @unique
  active    Boolean    @default(true)
  employees Employee[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

`Employee` model changes:
- Remove `department String`
- Add `departmentId String` + `department Department @relation(...)`

Migration required. Seed existing department strings as Department records and backfill `departmentId` on employees.

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/departments` | List all departments (query: `?active=true` to filter) |
| POST | `/api/departments` | Create department (`{ name }`) |
| PUT | `/api/departments/[id]` | Edit name or toggle `active` |

**Validation:** Cannot deactivate a department that has ACTIVO employees assigned. Return 409 with descriptive error.

### UI — Settings Page

- New sidebar entry: ⚙ **Configuración** → `/settings`
- Table columns: Nombre, Estado (ACTIVO/INACTIVO badge), Acciones
- "Nuevo departamento" button → modal with name input
- Per-row: edit name inline + deactivate/reactivate button
- Department dropdowns across the app (create form, legajo edit) use `GET /api/departments?active=true`
- Employee list department filter uses the same source

---

## 3. Legajo Editing

### Edit Mode

- "Editar perfil" button in employee profile header toggles `editing: boolean` state
- In edit mode: inputs replace display text across all tabs
- "Guardar cambios" → `PUT /api/employees/[id]` → refresh data
- "Cancelar" → revert to read-only, discard local changes

### Editable Fields by Tab

| Tab | Fields |
|-----|--------|
| **Personal** | firstName, lastName, cuil, birthDate, maritalStatus, address, email |
| **Contacto** | emergencyContact.name, emergencyContact.relationship, emergencyContact.phone |
| **Laboral** | role, departmentId (dropdown), hireDate, exitDate, status (ACTIVO/INACTIVO) |
| **Documentos** | No field editing — document managed via upload (Section 4) |

### Validation

Required fields: firstName, lastName, cuil, email, role, departmentId — cannot be empty on save.  
Dates must be valid ISO format (use `<input type="date">`).  
"Dar de baja" = set `status: INACTIVO`, not delete.

### API

`PUT /api/employees/[id]` already exists in `lib/employees.ts`. Wire up the form submit to call it.  
Response: updated employee object → replace local state.

---

## 4. Document Upload

### Storage

- Base path: `/uploads/{employeeId}/{cuid()}-{originalFileName}`
- Docker volume: mount `uploads:/app/uploads` in `docker-compose.yml`

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/employees/[id]/documents` | Upload file + create Document record. `multipart/form-data`: file, name, category, expiryDate? |
| DELETE | `/api/employees/[id]/documents/[docId]` | Delete DB record + file from disk |
| GET | `/api/uploads/[...path]` | Serve file with auth check (session required) |

### Document Record

On upload, create `Document` in DB with `fileName` = relative path (e.g. `EMP-123/abc-contrato.pdf`).  
Serve via `/api/uploads/EMP-123/abc-contrato.pdf` (protected route).

### UI — Documentos Tab

- "Subir Documento" button → modal with: document name, category (enum dropdown), expiry date (optional), file input
- Real upload progress via `XMLHttpRequest` with progress event
- On success: refresh document list
- "Descargar" button on each row → GET `/api/uploads/...`
- "Eliminar" button on RECHAZADO/EXPIRADO documents

### next.config.mjs

No static serving of uploads — always via authenticated API route.

---

## Implementation Order

1. Bug fix (employee creation dates + payload cleanup)
2. Department model + migration + API + Settings page
3. Legajo edit mode + PUT wiring
4. Document upload API + UI

---

## Out of Scope

- Payslip generation (signing remains simulated for now)
- File type validation beyond basic MIME check
- Document versioning
- Role-based permissions
