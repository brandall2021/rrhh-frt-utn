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
