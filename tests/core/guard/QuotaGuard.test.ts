import { describe, expect, it } from "vitest";
import { QuotaGuard } from "../../../src/core/guard/QuotaGuard";
import { PlanType } from "../../../src/core/plans/PlanTypes";

describe("QuotaGuard", () => {

  it("allows request when usage is below limit", async () => {

    const repo = {

      countToday: async () => 10

    };

    const guard = new QuotaGuard(repo as any);

    await expect(

      guard.check("owner-1", PlanType.FREE)

    ).resolves.toBeUndefined();

  });

  it("throws when free quota is exceeded", async () => {

    const repo = {

      countToday: async () => 100

    };

    const guard = new QuotaGuard(repo as any);

    await expect(

      guard.check("owner-1", PlanType.FREE)

    ).rejects.toThrow();

  });

  it("never throws for enterprise plan", async () => {

    const repo = {

      countToday: async () => 999999

    };

    const guard = new QuotaGuard(repo as any);

    await expect(

      guard.check("owner-1", PlanType.ENTERPRISE)

    ).resolves.toBeUndefined();

  });

});