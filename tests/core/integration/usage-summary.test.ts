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

describe("/usage/summary (integration)", () => {

  beforeEach(async () => {
    await resetDatabase();
  });

  it("summarizes total, per-day and per-path usage for the authenticated owner", async () => {

    const apiKey = await createApiKey("owner-1");
    const headers = { "x-api-key": apiKey, "Content-Type": "application/json" };

    await call("/subscribe", { method: "POST", headers, body: JSON.stringify({}) });
    await call("/sub", { headers });
    await call("/sub", { headers });

    const summary = await call("/usage/summary", { headers });

    expect(summary.status).toBe(200);
    expect(summary.body.data.data.total).toBe(3);
    expect(Array.isArray(summary.body.data.data.last7Days)).toBe(true);
    expect(Array.isArray(summary.body.data.data.byPath)).toBe(true);

    const subPathEntry = summary.body.data.data.byPath.find((p: any) => p.path === "/sub");
    expect(subPathEntry.count).toBe(2);
  });

  it("returns zeroed-out usage for an owner who made no requests yet", async () => {

    const apiKey = await createApiKey("owner-2");

    const summary = await call("/usage/summary", {
      headers: { "x-api-key": apiKey },
    });

    expect(summary.status).toBe(200);
    expect(summary.body.data.data.total).toBe(0);
    expect(summary.body.data.data.byPath).toEqual([]);
  });

  it("requires authentication", async () => {

    const summary = await call("/usage/summary");

    expect(summary.status).toBe(401);
  });

});
