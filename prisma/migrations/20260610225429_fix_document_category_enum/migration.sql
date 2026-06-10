-- Normalizar DocumentCategory enum de PascalCase a SCREAMING_SNAKE_CASE
ALTER TYPE "DocumentCategory" RENAME VALUE 'Identidad' TO 'IDENTIDAD';
ALTER TYPE "DocumentCategory" RENAME VALUE 'Academico' TO 'ACADEMICO';
ALTER TYPE "DocumentCategory" RENAME VALUE 'Contractual' TO 'CONTRACTUAL';
ALTER TYPE "DocumentCategory" RENAME VALUE 'Medico' TO 'MEDICO';
ALTER TYPE "DocumentCategory" RENAME VALUE 'Legales' TO 'LEGALES';
