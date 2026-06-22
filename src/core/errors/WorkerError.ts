export type ErrorCode =
  | "INTERNAL_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED";

export class WorkerError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(params: {
    code: ErrorCode;
    message: string;
    status?: number;
    details?: unknown;
  }) {
    super(params.message);

    this.name = "WorkerError";
    this.code = params.code;
    this.status = params.status ?? 500;
    this.details = params.details;
  }
}