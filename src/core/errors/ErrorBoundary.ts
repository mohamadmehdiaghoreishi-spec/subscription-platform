import { WorkerError } from "./WorkerError";

export class ErrorBoundary {
  static handle(error: unknown): Response {
    // اگر خطا از نوع WorkerError بود
    if (error instanceof WorkerError) {
      return new Response(
        JSON.stringify(error.toJSON()),
        {
          status: error.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // خطای ناشناخته
    const fallback = {
      name: "InternalError",
      code: "INTERNAL_ERROR",
      message: "Unexpected error occurred",
      status: 500,
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(fallback), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}