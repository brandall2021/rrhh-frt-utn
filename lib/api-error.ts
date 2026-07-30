import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function apiValidationError(error: string, details: ZodError["issues"]) {
  return NextResponse.json({ error, details }, { status: 400 });
}

export function handleZodError(err: unknown) {
  if (err instanceof ZodError) {
    return apiValidationError("Datos inválidos", err.issues);
  }
  throw err;
}
