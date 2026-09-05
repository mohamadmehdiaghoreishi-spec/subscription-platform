import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";

import { D1PlanRepository } from "../../src/infrastructure/d1/D1PlanRepository";
import { PlanType } from "../../src/core/plans/PlanTypes";
import { resetDatabase } from "../helpers/db";

describe("D1PlanRepository", () => {

  const repo = new D1PlanRepository(env.DB);

  beforeEach(async () => {
    await resetDatabase();
  });

  it("defaults to FREE when a subscription has no assigned plan", async () => {

    const plan = await repo.getBySubscription("sub-with-no-plan");

    expect(plan).toBe(PlanType.FREE);
  });

  it("assigns a plan and returns it afterwards", async () => {

    await repo.assign("sub-1", PlanType.PRO);

    const plan = await repo.getBySubscription("sub-1");

    expect(plan).toBe(PlanType.PRO);
  });

  it("re-assigning a plan updates the existing row instead of duplicating it", async () => {

    await repo.assign("sub-2", PlanType.BASIC);
    await repo.assign("sub-2", PlanType.ENTERPRISE);

    const plan = await repo.getBySubscription("sub-2");

    expect(plan).toBe(PlanType.ENTERPRISE);

    const rows = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM subscription_plans WHERE subscriptionId = ?"
    ).bind("sub-2").first<{ count: number }>();

    expect(rows?.count).toBe(1);
  });

  it("throws when assigning a plan name that doesn't exist", async () => {

    await expect(
      repo.assign("sub-3", "NOT_A_REAL_PLAN" as PlanType)
    ).rejects.toThrow();

  });

});
