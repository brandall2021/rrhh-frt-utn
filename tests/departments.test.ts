import { describe, test, expect } from "vitest";
import { getDepartments, createDepartment, updateDepartment, deactivateDepartment } from "@/lib/departments";

describe("getDepartments", () => {
  test("exporta una función", () => {
    expect(typeof getDepartments).toBe("function");
  });
});

describe("createDepartment", () => {
  test("exporta una función", () => {
    expect(typeof createDepartment).toBe("function");
  });
});

describe("updateDepartment", () => {
  test("exporta una función", () => {
    expect(typeof updateDepartment).toBe("function");
  });
});

describe("deactivateDepartment", () => {
  test("exporta una función", () => {
    expect(typeof deactivateDepartment).toBe("function");
  });
});
