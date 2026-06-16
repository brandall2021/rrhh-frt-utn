-- Create AbsenceType and Absence tables
CREATE TABLE "AbsenceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "AbsenceType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Absence" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "absenceTypeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Absence_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Absence" ADD CONSTRAINT "Absence_absenceTypeId_fkey" FOREIGN KEY ("absenceTypeId") REFERENCES "AbsenceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Absence" ADD CONSTRAINT "Absence_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
