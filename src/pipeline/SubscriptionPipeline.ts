import { WorkerError } from "../core/errors/WorkerError";
import { PolicyResolver } from "../core/policy/PolicyResolver";

export class SubscriptionPipeline {
  async execute(request: Request): Promise<string> {
    const policy = new PolicyResolver();

    // بررسی قوانین
    await policy.check(request);

    const url = new URL(request.url);

    // اگر رسید اینجا یعنی اجازه دارد
    if (url.pathname === "/sub") {
      return "Pipeline working 🚀";
    }

    throw new WorkerError({
      code: "NOT_FOUND",
      message: "Route not found",
    });
  }
}