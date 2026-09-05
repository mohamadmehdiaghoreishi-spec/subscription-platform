import { describe, it, expect, vi } from "vitest";

import { PlanService } from "../../../src/core/plans/PlanService";
import { PlanType } from "../../../src/core/plans/PlanTypes";

describe("PlanService", () => {

  it("getSubscriptionPlan() delegates to repository.getBySubscription()", async () => {

    const repo = {
      getBySubscription: vi.fn(async () => PlanType.PRO),
      assign: vi.fn(async () => undefined),
    };

    const service = new PlanService(repo as any);

    const plan = await service.getSubscriptionPlan("sub-1");

    expect(repo.getBySubscription).toHaveBeenCalledWith("sub-1");
    expect(plan).toBe(PlanType.PRO);
  });

  it("assignPlan() delegates to repository.assign()", async () => {

    const repo = {
      getBySubscription: vi.fn(async () => PlanType.FREE),
      assign: vi.fn(async () => undefined),
    };

    const service = new PlanService(repo as any);

    await service.assignPlan("sub-1", PlanType.ENTERPRISE);

    expect(repo.assign).toHaveBeenCalledWith("sub-1", PlanType.ENTERPRISE);
  });

});
