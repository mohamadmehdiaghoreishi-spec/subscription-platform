import { WorkerError } from "../errors/WorkerError";
import { ErrorCode } from "../errors/ErrorCode";

export class QuotaGuard {
  async check(ip: string) {
    const limit = 100;

    const used = 0; // placeholder

    if (used > limit) {
      throw new WorkerError({
        code: ErrorCode.RATE_LIMITED,
        message: "Rate limit exceeded",
        metadata: {
          ip,
          limit,
          window: 60,
        },
      });
    }

    return true;
  }
}