import { describe, it, expect, vi, afterEach } from "vitest";
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import worker from "../src/index";

describe("Health", () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 and status ok when the database is reachable", async () => {

    const request = new Request("http://example.com/");
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);

    const body = await response.json() as any;

    expect(body.status).toBe("ok");
    expect(typeof body.db.latencyMs).toBe("number");

  });

  it("returns 503 and status error when the database is unreachable", async () => {

    vi.spyOn(env.DB, "prepare").mockImplementation(() => {
      throw new Error("D1 connection refused");
    });

    const request = new Request("http://example.com/");
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(503);

    const body = await response.json() as any;

    expect(body.status).toBe("error");
    expect(typeof body.db.latencyMs).toBe("number");

  });

});
