import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect } from "vitest";

import worker from "../../../src/index";

describe("Subscribe endpoint", () => {

  it("returns unauthorized without api key", async () => {

    const request = new Request("http://localhost/subscribe", {
      method: "POST",
      body: JSON.stringify({})
    });

    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);

    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(401);

    const body = await response.json();

    expect(body.success).toBe(false);

  });

});
