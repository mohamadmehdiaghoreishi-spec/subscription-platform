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

describe("API key management (integration)", () => {

  beforeEach(async () => {
    await resetDatabase();
  });

  it("lists api keys scoped to the authenticated owner", async () => {

    const apiKey = await createApiKey("owner-1");
    await createApiKey("owner-1"); // a second key for the same owner
    await createApiKey("someone-else"); // must not show up in owner-1's list

    const list = await call("/auth/keys", {
      headers: { "x-api-key": apiKey },
    });

    expect(list.status).toBe(200);
    expect(list.body.data.data.length).toBe(2);
    expect(list.body.data.data.every((k: any) => k.ownerId === "owner-1")).toBe(true);
  });

  it("revoking a key makes it unusable for future requests", async () => {

    const apiKey = await createApiKey("owner-2");

    const revoke = await call("/auth/revoke-key", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ key: apiKey }),
    });

    expect(revoke.status).toBe(200);

    const attempt = await call("/subscribe", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(attempt.status).toBe(403);
  });

});
