import { ErrorCode } from "./ErrorCode";

export { ErrorCode } from "./ErrorCode";


export interface WorkerErrorPayload {
  code: ErrorCode;
  message: string;
  status?: number;
  details?: unknown;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}


export class WorkerError extends Error {

  public readonly code: ErrorCode;

  public readonly status: number;

  public readonly details?: unknown;

  public readonly metadata?: Record<string, unknown>;

  public readonly timestamp: string;


  constructor(
    payload: WorkerErrorPayload
  ) {

    super(payload.message);

    this.name = "WorkerError";

    this.code = payload.code;

    this.status =
      payload.status ?? 500;

    this.details =
      payload.details;

    this.metadata =
      payload.metadata;

    this.timestamp =
      payload.timestamp ??
      new Date().toISOString();
  }


  toJSON() {

    return {
      name: this.name,
      code: this.code,
      status: this.status,
      message: this.message,
      details: this.details,
      metadata: this.metadata,
      timestamp: this.timestamp,
    };

  }

}


export function isWorkerError(
  error: unknown
): error is WorkerError {

  return error instanceof WorkerError;

}