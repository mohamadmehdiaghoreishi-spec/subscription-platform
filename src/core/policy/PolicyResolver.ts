export class PolicyResolver {
  check(request: Request): void {
    const url = new URL(request.url);

    // Allow root and /sub
    if (url.pathname === "/" || url.pathname === "/sub" || url.pathname.startsWith("/sub/")) {
      return; // OK
    }

    throw {
      name: "WorkerError",
      code: "FORBIDDEN",
      status: 403,
      message: "Access denied"
    };
  }
}