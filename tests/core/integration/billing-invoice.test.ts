import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";

import worker from "../../../src/index";
import { resetDatabase } from "../../helpers/db";

async function call(path: string, init?: RequestInit) {
  const request = new Request(`http://localhost${path}`, init);
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  const body = await response.json() as any;
  return { status: response.status, body };
}

async function createApiKey(ownerId: string) {
  const created = await call("/auth/create-key", {
    method: "POST",
    body: JSON.stringify({ subscriptionId: ownerId }),
  });
  return created.body.data.data.key as string;
}

describe("Billing / invoice (integration)", () => {

  beforeEach(async () => {
    await resetDatabase();
  });

  it("generates an invoice reflecting usage logged by prior requests", async () => {

    const apiKey = await createApiKey("owner-1");
    const headers = { "x-api-key": apiKey, "Content-Type": "application/json" };

    // each /sub call logs one usage row for owner-1
    await call("/sub", { headers });
    await call("/sub", { headers });
    await call("/sub", { headers });

    const invoice = await call("/billing/invoice", { headers });

    expect(invoice.status).toBe(200);
    expect(invoice.body.data.data.subscriptionId).toBe("owner-1");
    expect(invoice.body.data.data.usageCount).toBe(3);
    expect(invoice.body.data.data.cost).toBeCloseTo(0.003);
  });

  it("generates a zero-usage invoice for an owner who made no requests yet", async () => {

    const apiKey = await createApiKey("owner-2");

    const invoice = await call("/billing/invoice", {
      headers: { "x-api-key": apiKey },
    });

    expect(invoice.status).toBe(200);
    expect(invoice.body.data.data.usageCount).toBe(0);
    expect(invoice.body.data.data.cost).toBe(0);
  });

});
