import {
  WorkerError,
  ErrorCode,
  isWorkerError
} from "./WorkerError";

import { ErrorStatusMap } from "./ErrorStatusMap";


export class ErrorBoundary {

  static toResponse(error: unknown): Response {

    // -------------------------
    // Known application error
    // -------------------------
    if (isWorkerError(error)) {

      const payload = error.toJSON();

      const responseError =
        payload.metadata?.internalOnly === true
          ? { ...payload, metadata: undefined }
          : payload;

      if (payload.metadata?.internalOnly === true) {
        console.error("[WorkerError:internal]", JSON.stringify(payload));
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: responseError,
          timestamp: new Date().toISOString()
        }),
        {
          status: error.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // -------------------------
    // Unknown error fallback
    // -------------------------
    const fallback = {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error",
        status: ErrorStatusMap[ErrorCode.UNKNOWN_ERROR],
        timestamp: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(fallback),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}