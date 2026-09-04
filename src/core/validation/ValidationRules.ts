import { WorkerError, ErrorCode } from "../errors/WorkerError";


export function asRecord(
  value: unknown,
  context: string
): Record<string, unknown> {

  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {

    throw new WorkerError({
      code: ErrorCode.VALIDATION,
      message: `${context}: request body must be a JSON object`
    });

  }

  return value as Record<string, unknown>;

}


export function requireString(
  body: Record<string, unknown>,
  field: string
): string {

  const value = body[field];

  if (typeof value !== "string" || value.trim().length === 0) {

    throw new WorkerError({
      code: ErrorCode.VALIDATION,
      message: `${field} is required and must be a non-empty string`
    });

  }

  return value;

}


export function optionalString(
  body: Record<string, unknown>,
  field: string
): string | undefined {

  const value = body[field];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string" || value.trim().length === 0) {

    throw new WorkerError({
      code: ErrorCode.VALIDATION,
      message: `${field} must be a non-empty string if provided`
    });

  }

  return value;

}


export function requireOneOf<T extends string>(
  body: Record<string, unknown>,
  field: string,
  allowed: readonly T[]
): T {

  const value = body[field];

  if (typeof value !== "string" || !allowed.includes(value as T)) {

    throw new WorkerError({
      code: ErrorCode.VALIDATION,
      message: `${field} is required and must be one of: ${allowed.join(", ")}`
    });

  }

  return value as T;

}


export function optionalOneOf<T extends string>(
  body: Record<string, unknown>,
  field: string,
  allowed: readonly T[]
): T | undefined {

  const value = body[field];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string" || !allowed.includes(value as T)) {

    throw new WorkerError({
      code: ErrorCode.VALIDATION,
      message: `${field} must be one of: ${allowed.join(", ")}`
    });

  }

  return value as T;

}
