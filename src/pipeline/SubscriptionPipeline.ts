import { PolicyResolver } from "../core/policy/PolicyResolver";

export class SubscriptionPipeline {
  async execute(request: Request): Promise<any> {
    const policy = new PolicyResolver();
    policy.check(request);

    const url = new URL(request.url);

    if (url.pathname === "/") {
      return {
        status: "ok",
        message: "Subscription Platform Root",
        timestamp: Date.now()
      };
    }

    if (url.pathname === "/sub") {
      return {
        status: "ok",
        message: "Subscription Endpoint Ready 🚀",
        endpoint: "/sub",
        timestamp: Date.now()
      };
    }

    throw {
      name: "WorkerError",
      code: "NOT_FOUND",
      status: 404,
      message: "Route not found"
    };
  }
}