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
