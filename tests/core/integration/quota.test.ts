import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";

import worker from "../../../src/index";
import { resetDatabase } from "../../helpers/db";
import { PlanLimits } from "../../../src/core/plans/PlanTypes";

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

describe("Quota enforcement (integration)", () => {

  beforeEach(async () => {
    await resetDatabase();
  });

  it("blocks a FREE plan owner once the daily request limit is reached", async () => {

    const apiKey = await createApiKey("owner-1");
    const headers = { "x-api-key": apiKey, "Content-Type": "application/json" };

    const limit = PlanLimits.FREE.requestsPerDay;

    // fill up the quota with successful /subscribe calls
    for (let i = 0; i < limit; i++) {
      const result = await call("/subscribe", { method: "POST", headers, body: JSON.stringify({}) });
      expect(result.status).toBe(200);
    }

    // the next one should be rate limited
    const blocked = await call("/subscribe", { method: "POST", headers, body: JSON.stringify({}) });

    expect(blocked.status).toBe(429);

  }, 20000);

  it("quota is scoped per owner — one owner filling their quota doesn't affect another", async () => {

    const busyOwnerKey = await createApiKey("busy-owner");
    const quietOwnerKey = await createApiKey("quiet-owner");

    const limit = PlanLimits.FREE.requestsPerDay;

    for (let i = 0; i < limit; i++) {
      await call("/subscribe", {
        method: "POST",
        headers: { "x-api-key": busyOwnerKey, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    }

    const stillBlocked = await call("/subscribe", {
      method: "POST",
      headers: { "x-api-key": busyOwnerKey, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(stillBlocked.status).toBe(429);

    const quietStillWorks = await call("/subscribe", {
      method: "POST",
      headers: { "x-api-key": quietOwnerKey, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(quietStillWorks.status).toBe(200);

  }, 20000);

});
