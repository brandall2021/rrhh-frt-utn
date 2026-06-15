-- Drop PaySlip table and its foreign key
ALTER TABLE "PaySlip" DROP CONSTRAINT "PaySlip_employeeId_fkey";
DROP TABLE "PaySlip";
