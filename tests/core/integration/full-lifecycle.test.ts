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

describe("Full subscription lifecycle (integration)", () => {

  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates an api key for a new owner", async () => {

    const created = await call("/auth/create-key", {
      method: "POST",
      body: JSON.stringify({ subscriptionId: "owner-1" }),
    });

    expect(created.status).toBe(200);
    expect(created.body.data.data.ownerId).toBe("owner-1");
    expect(created.body.data.data.status).toBe("active");
  });

  it("rejects create-key requests with no subscriptionId", async () => {

    const created = await call("/auth/create-key", {
      method: "POST",
      body: JSON.stringify({}),
    });

    expect(created.status).toBe(400);
  });

  it("rejects requests to protected routes without an api key", async () => {

    const result = await call("/subscribe", {
      method: "POST",
      body: JSON.stringify({}),
    });

    expect(result.status).toBe(401);
  });

  it("rejects requests with an unknown api key", async () => {

    const result = await call("/subscribe", {
      method: "POST",
      headers: { "x-api-key": "not-a-real-key" },
      body: JSON.stringify({}),
    });

    expect(result.status).toBe(401);
  });

  it("rejects an unknown route even with a valid api key", async () => {

    const apiKey = await createApiKey("owner-2");

    const result = await call("/totally/not/a/route", {
      headers: { "x-api-key": apiKey },
    });

    expect(result.status).toBe(403);
  });

  it("creates a subscription via /subscribe", async () => {

    const apiKey = await createApiKey("owner-3");

    const subscribe = await call("/subscribe", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(subscribe.status).toBe(200);
    expect(subscribe.body.data.data.ownerId).toBe("owner-3");
    expect(subscribe.body.data.data.status).toBe("CREATED");
  });

  it("lists subscriptions scoped to the authenticated owner", async () => {

    const apiKey = await createApiKey("owner-4");
    const headers = { "x-api-key": apiKey, "Content-Type": "application/json" };

    await call("/subscribe", { method: "POST", headers, body: JSON.stringify({}) });
    await call("/subscribe", { method: "POST", headers, body: JSON.stringify({}) });

    const list = await call("/subscriptions", { headers });

    expect(list.status).toBe(200);
    expect(list.body.data.data.length).toBe(2);
    expect(list.body.data.data.every((s: any) => s.ownerId === "owner-4")).toBe(true);
  });

  // BUG-004 (ROADMAP) is fully fixed: ExecutorRegistry's getSubscription(),
  // cancelSubscription(), and activateSubscription() all resolve the row via
  // ownerId instead of the row's own primary key "id" (see
  // tests/core/integration/payment-flow.test.ts for the payment-activation
  // case).

  it("GET /subscription returns the owner's most recent subscription", async () => {

    const apiKey = await createApiKey("owner-5");
    const headers = { "x-api-key": apiKey, "Content-Type": "application/json" };

    await call("/subscribe", { method: "POST", headers, body: JSON.stringify({}) });

    const single = await call("/subscription", { headers });

    expect(single.status).toBe(200);
    expect(single.body.data.data.ownerId).toBe("owner-5");
  });

  it("POST /subscription/cancel actually marks the subscription as CANCELED in the database", async () => {

    const apiKey = await createApiKey("owner-6");
    const headers = { "x-api-key": apiKey, "Content-Type": "application/json" };

    await call("/subscribe", { method: "POST", headers, body: JSON.stringify({}) });

    const cancel = await call("/subscription/cancel", { method: "POST", headers });
    expect(cancel.status).toBe(200);

    const list = await call("/subscriptions", { headers });
    expect(list.body.data.data[0].status).toBe("CANCELED");
  });

  it("POST /subscription/cancel 404s when the owner has no subscription to cancel", async () => {

    const apiKey = await createApiKey("owner-7");

    const cancel = await call("/subscription/cancel", {
      method: "POST",
      headers: { "x-api-key": apiKey },
    });

    expect(cancel.status).toBe(404);
  });

});
