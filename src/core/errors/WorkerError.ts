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
  public readonly timestamp: number;

  constructor(params: {
    code: ErrorCode;
    message: string;
    status?: number;
    details?: unknown;
  }) {
    super(params.message);

    this.name = "WorkerError";
    this.code = params.code;
    this.details = params.details;
    this.timestamp = Date.now();

    // 👇 مهم: status درست از روی code ساخته میشه
    this.status = params.status ?? WorkerError.mapStatus(params.code);
  }

  private static mapStatus(code: ErrorCode): number {
    switch (code) {
      case "VALIDATION_ERROR":
        return 400;
      case "UNAUTHORIZED":
        return 401;
      case "FORBIDDEN":
        return 403;
      case "NOT_FOUND":
        return 404;
      case "RATE_LIMITED":
        return 429;
      case "INTERNAL_ERROR":
      default:
        return 500;
    }
  }

  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      status: this.status,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}