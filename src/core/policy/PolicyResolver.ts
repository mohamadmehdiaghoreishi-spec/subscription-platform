import { WorkerError } from "../errors/WorkerError";

export class PolicyResolver {
  async check(request: Request): Promise<void> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/sub")) {
      throw new WorkerError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }
  }
}