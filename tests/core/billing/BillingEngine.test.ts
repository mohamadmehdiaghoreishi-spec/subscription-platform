import { describe, it, expect, vi } from "vitest";

import { BillingEngine } from "../../../src/core/billing/BillingEngine";

describe("BillingEngine", () => {

  it("generates an invoice priced from today's usage count", async () => {

    const usageRepo = {
      countToday: vi.fn(async () => 500),
    };

    const billingRepo = {
      create: vi.fn(async () => undefined),
    };

    const engine = new BillingEngine(usageRepo as any, billingRepo as any);

    const invoice = await engine.generateInvoice("owner-1");

    expect(invoice.subscriptionId).toBe("owner-1");
    expect(invoice.usageCount).toBe(500);
    expect(invoice.cost).toBeCloseTo(0.5); // 500 * 0.001
    expect(billingRepo.create).toHaveBeenCalledWith(invoice);
  });

  it("generates a zero-cost invoice when there's no usage", async () => {

    const usageRepo = { countToday: vi.fn(async () => 0) };
    const billingRepo = { create: vi.fn(async () => undefined) };

    const engine = new BillingEngine(usageRepo as any, billingRepo as any);

    const invoice = await engine.generateInvoice("owner-2");

    expect(invoice.usageCount).toBe(0);
    expect(invoice.cost).toBe(0);
  });

  it("sets a 24-hour billing period ending now", async () => {

    const usageRepo = { countToday: vi.fn(async () => 10) };
    const billingRepo = { create: vi.fn(async () => undefined) };

    const engine = new BillingEngine(usageRepo as any, billingRepo as any);

    const before = Date.now();
    const invoice = await engine.generateInvoice("owner-3");
    const after = Date.now();

    const start = new Date(invoice.periodStart).getTime();
    const end = new Date(invoice.periodEnd).getTime();

    expect(end).toBeGreaterThanOrEqual(before);
    expect(end).toBeLessThanOrEqual(after);
    expect(end - start).toBeCloseTo(24 * 60 * 60 * 1000, -3);
  });

});
