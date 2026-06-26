import {
  WorkerError,
  ErrorCode
} from "../errors/WorkerError";

import {
  D1UsageRepository
} from "../../infrastructure/d1/D1UsageRepository";

import {
  PlanLimits,
  PlanType
} from "../plans/PlanTypes";

export class QuotaGuard {

  constructor(
    private usageRepo: D1UsageRepository
  ) {}

  async check(
    subscriptionId: string,
    plan: PlanType
  ): Promise<void> {

    const usage =
      await this.usageRepo.countToday(
        subscriptionId
      );

    const limits =
      PlanLimits[plan];

    if (!limits) {

      throw new WorkerError({

        code: ErrorCode.INTERNAL_ERROR,

        message: "Unknown subscription plan",

        metadata: {
          subscriptionId,
          plan
        }

      });

    }

    const limit =
      limits.requestsPerDay;

    if (usage >= limit) {

      throw new WorkerError({

        code: ErrorCode.RATE_LIMITED,

        message: "Quota exceeded",

        metadata: {

          subscriptionId,

          usage,

          limit,

          plan

        }

      });

    }

  }

}