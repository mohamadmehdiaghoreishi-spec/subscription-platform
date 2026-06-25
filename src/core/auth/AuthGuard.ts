import { D1ApiKeyRepository } from "../../infrastructure/d1/D1ApiKeyRepository";
import { WorkerError, ErrorCode } from "../errors/WorkerError";
import { SubscriptionContext } from "../context/SubscriptionContext";

export class AuthGuard {

  constructor(
    private repository: D1ApiKeyRepository
  ) {}

  async authenticate(request: Request): Promise<SubscriptionContext> {

    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      throw new WorkerError({
        code: ErrorCode.UNAUTHORIZED,
        message: "Missing API key"
      });
    }

    const record = await this.repository.findByKey(apiKey);

    if (!record) {
      throw new WorkerError({
        code: ErrorCode.UNAUTHORIZED,
        message: "Invalid API key"
      });
    }

    if (record.status !== "active") {
      throw new WorkerError({
        code: ErrorCode.FORBIDDEN,
        message: "API key revoked"
      });
    }

    return {
      apiKey: record.key,
      subscriptionId: record.subscriptionId
    };
  }
}