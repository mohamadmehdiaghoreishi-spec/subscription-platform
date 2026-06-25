export class ApiResponse {

  static success(data: unknown) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    code: string,
    message: string,
    metadata?: unknown
  ) {
    return {
      success: false,
      error: {
        code,
        message,
        metadata,
      },
      timestamp: new Date().toISOString(),
    };
  }
}