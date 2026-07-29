-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVO', 'INACTIVO');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'OPERADOR';
ALTER TABLE "AdminUser" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVO';
