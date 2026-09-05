import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";

import { D1BillingRepository } from "../../src/infrastructure/d1/D1BillingRepository";
import { resetDatabase } from "../helpers/db";

describe("D1BillingRepository", () => {

  const repo = new D1BillingRepository(env.DB);

  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates an invoice row and can read it back via getBySubscription", async () => {

    const invoice = {
      id: "inv-1",
      subscriptionId: "sub-1",
      usageCount: 42,
      cost: 0.042,
      periodStart: "2024-01-01T00:00:00.000Z",
      periodEnd: "2024-01-02T00:00:00.000Z",
      createdAt: "2024-01-02T00:00:00.000Z",
    };

    await repo.create(invoice);

    const result = await repo.getBySubscription("sub-1");

    expect(result.results?.length).toBe(1);
    expect((result.results?.[0] as any).usageCount).toBe(42);
    expect((result.results?.[0] as any).cost).toBeCloseTo(0.042);
  });

  it("returns no rows for a subscription with no invoices", async () => {

    const result = await repo.getBySubscription("no-invoices-here");

    expect(result.results?.length).toBe(0);
  });

});
