// ─── FIX for TS2339 ───────────────────────────────────────────────────────────
// src/index.ts calls `ErrorBoundary.toResponse(error)` as a static method.
// The previous implementation did not expose a static `toResponse`.
// ─────────────────────────────────────────────────────────────────────────────
import { isWorkerError, WorkerError, ErrorCode, WorkerErrorPayload } from './WorkerError';
import { ErrorStatusMap } from './ErrorStatusMap';

export class ErrorBoundary {
  /**
   * Converts any thrown value into a well-formed JSON Response.
   * Called as:  ErrorBoundary.toResponse(error)
   */
  static toResponse(error: unknown): Response {
    if (isWorkerError(error)) {
      const status = ErrorStatusMap[error.code] ?? 500;
      return new Response(
        JSON.stringify({
          error:     error.code,
          message:   error.message,
          timestamp: error.timestamp,
          ...(error.metadata ? { metadata: error.metadata } : {}),
          ...(error.details  ? { details:  error.details  } : {}),
        }),
        {
          status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Plain Error, string, undefined — never access .code on these
    const message = error instanceof Error ? error.message : String(error);
    console.error('[ErrorBoundary] Unhandled non-WorkerError:', error);

    return new Response(
      JSON.stringify({
        error:     ErrorCode.INTERNAL_ERROR,
        message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Wraps an async handler so any throw is caught and converted to a Response.
   * Optional convenience — use if you prefer a wrapper pattern.
   */
  static async wrap(fn: () => Promise<Response>): Promise<Response> {
    try {
      return await fn();
    } catch (error) {
      return ErrorBoundary.toResponse(error);
    }
  }
}
