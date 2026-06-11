import { describe, test, expect } from "vitest";
import { canTransition, VALID_TRANSITIONS } from "@/lib/requests";

describe("canTransition", () => {
  test("PENDIENTE puede pasar a APROBADO", () => {
    expect(canTransition("PENDIENTE", "APROBADO")).toBe(true);
  });

  test("PENDIENTE puede pasar a RECHAZADO", () => {
    expect(canTransition("PENDIENTE", "RECHAZADO")).toBe(true);
  });

  test("APROBADO puede pasar a PROCESADO", () => {
    expect(canTransition("APROBADO", "PROCESADO")).toBe(true);
  });

  test("RECHAZADO no puede pasar a APROBADO", () => {
    expect(canTransition("RECHAZADO", "APROBADO")).toBe(false);
  });

  test("PROCESADO no puede pasar a ningún estado", () => {
    expect(canTransition("PROCESADO", "APROBADO")).toBe(false);
    expect(canTransition("PROCESADO", "RECHAZADO")).toBe(false);
    expect(canTransition("PROCESADO", "PENDIENTE")).toBe(false);
  });

  test("PENDIENTE no puede pasar a PROCESADO directamente", () => {
    expect(canTransition("PENDIENTE", "PROCESADO")).toBe(false);
  });
});
