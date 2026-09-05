import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

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

describe("Zarinpal payment flow (integration)", () => {

  beforeEach(async () => {
    await resetDatabase();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts a checkout session and returns a Zarinpal StartPay url", async () => {

    vi.stubGlobal("fetch", vi.fn(async () => ({
      json: async () => ({ data: { code: 100, authority: "AUTH-CHECKOUT" } }),
    } as Response)));

    const apiKey = await createApiKey("owner-1");

    const checkout = await call("/billing/checkout", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "PRO" }),
    });

    expect(checkout.status).toBe(200);
    expect(checkout.body.data.data.authority).toBe("AUTH-CHECKOUT");
    expect(checkout.body.data.data.amount).toBe(300000);
    expect(checkout.body.data.data.url).toContain("AUTH-CHECKOUT");
  });

  it("rejects checkout for an unknown plan", async () => {

    vi.stubGlobal("fetch", vi.fn());

    const apiKey = await createApiKey("owner-2");

    const checkout = await call("/billing/checkout", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "NOT_A_PLAN" }),
    });

    // Milestone 7's validation layer now rejects an unknown plan name
    // before it ever reaches PaymentService/Zarinpal.
    expect(checkout.status).toBe(400);
  });

  it("rejects checkout without authentication", async () => {

    vi.stubGlobal("fetch", vi.fn());

    const checkout = await call("/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "PRO" }),
    });

    expect(checkout.status).toBe(401);
  });

  it("payment/callback with Status != OK reports the payment as cancelled, without calling Zarinpal", async () => {

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await call(
      "/payment/callback?Authority=A1&Status=NOK&ownerId=owner-3&plan=PRO",
      { method: "GET" }
    );

    expect(result.status).toBe(200);
    expect(result.body.data.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("payment/callback with missing parameters is rejected", async () => {

    const result = await call(
      "/payment/callback?Status=OK",
      { method: "GET" }
    );

    expect(result.status).toBe(400);
  });

  it("payment/callback verifies the payment against Zarinpal using the plan's price", async () => {

    const apiKey = await createApiKey("owner-4");
    await call("/subscribe", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const fetchMock = vi.fn(async (url: string, options: any) => {

      const body = JSON.parse(options.body);

      expect(body.amount).toBe(300000); // PRO plan price
      expect(body.authority).toBe("AUTH-CB");

      return {
        json: async () => ({ data: { code: 100, ref_id: 555 } }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await call(
      "/payment/callback?Authority=AUTH-CB&Status=OK&ownerId=owner-4&plan=PRO",
      { method: "GET" }
    );

    expect(result.status).toBe(200);
    expect(result.body.data.success).toBe(true);
    expect(result.body.data.data.refId).toBe(555);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("payment/callback returns 404 when the owner has no subscription to activate", async () => {

    vi.stubGlobal("fetch", vi.fn(async () => ({
      json: async () => ({ data: { code: 100, ref_id: 1 } }),
    } as Response)));

    const result = await call(
      "/payment/callback?Authority=AUTH-NOSUB&Status=OK&ownerId=owner-nobody&plan=PRO",
      { method: "GET" }
    );

    expect(result.status).toBe(404);
  });

  it("payment/callback rejects when Zarinpal reports the payment as not verified", async () => {

    vi.stubGlobal("fetch", vi.fn(async () => ({
      json: async () => ({ data: { code: -11 } }),
    } as Response)));

    const result = await call(
      "/payment/callback?Authority=AUTH-BAD&Status=OK&ownerId=owner-5&plan=PRO",
      { method: "GET" }
    );

    expect(result.status).toBe(401);
  });

  // Regression test for a bug found while writing this suite: the checkout
  // step used to require the client to pass an arbitrary "subscriptionId"
  // field, disconnected from the authenticated caller, which (a) was
  // confusing next to every other endpoint using only ownerId, and (b) let
  // a client name *any* subscription id, not necessarily its own. Checkout
  // and the payment callback now resolve the subscription to activate via
  // the authenticated ownerId only.
  it("a subscription actually becomes ACTIVE in the database after a verified payment", async () => {

    const apiKey = await createApiKey("owner-6");
    const headers = { "x-api-key": apiKey, "Content-Type": "application/json" };

    await call("/subscribe", { method: "POST", headers, body: JSON.stringify({}) });

    vi.stubGlobal("fetch", vi.fn(async () => ({
      json: async () => ({ data: { code: 100, ref_id: 999 } }),
    } as Response)));

    const callback = await call(
      "/payment/callback?Authority=AUTH-REAL&Status=OK&ownerId=owner-6&plan=PRO",
      { method: "GET" }
    );
    expect(callback.status).toBe(200);

    const list = await call("/subscriptions", { headers });
    expect(list.body.data.data[0].status).toBe("ACTIVE");
  });

  it("activating a subscription for one owner never touches another owner's subscription", async () => {

    const apiKeyA = await createApiKey("owner-7a");
    const apiKeyB = await createApiKey("owner-7b");
    const headersA = { "x-api-key": apiKeyA, "Content-Type": "application/json" };
    const headersB = { "x-api-key": apiKeyB, "Content-Type": "application/json" };

    await call("/subscribe", { method: "POST", headers: headersA, body: JSON.stringify({}) });
    await call("/subscribe", { method: "POST", headers: headersB, body: JSON.stringify({}) });

    vi.stubGlobal("fetch", vi.fn(async () => ({
      json: async () => ({ data: { code: 100, ref_id: 1000 } }),
    } as Response)));

    await call(
      "/payment/callback?Authority=AUTH-A&Status=OK&ownerId=owner-7a&plan=PRO",
      { method: "GET" }
    );

    const listA = await call("/subscriptions", { headers: headersA });
    const listB = await call("/subscriptions", { headers: headersB });

    expect(listA.body.data.data[0].status).toBe("ACTIVE");
    expect(listB.body.data.data[0].status).toBe("CREATED");
  });

});
