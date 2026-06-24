export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  RATE_LIMITED = "RATE_LIMITED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}



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
      payload.status ??
      WorkerError.mapStatus(payload.code);


    this.details =
      payload.details;


    this.metadata =
      payload.metadata;


    this.timestamp =
      payload.timestamp ??
      new Date().toISOString();

  }




  private static mapStatus(
    code: ErrorCode
  ): number {


    switch(code){


      case ErrorCode.BAD_REQUEST:

      case ErrorCode.VALIDATION:

        return 400;



      case ErrorCode.UNAUTHORIZED:

        return 401;



      case ErrorCode.FORBIDDEN:

        return 403;



      case ErrorCode.NOT_FOUND:

        return 404;



      case ErrorCode.RATE_LIMITED:

        return 429;



      case ErrorCode.INTERNAL_ERROR:

      case ErrorCode.UNKNOWN_ERROR:

      default:

        return 500;


    }

  }




  toJSON(){


    return {


      name:this.name,

      code:this.code,

      status:this.status,

      message:this.message,

      details:this.details,

      metadata:this.metadata,

      timestamp:this.timestamp


    };


  }


}




export function isWorkerError(
  error: unknown
): error is WorkerError {


  return error instanceof WorkerError;


}