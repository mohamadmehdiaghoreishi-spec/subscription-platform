import { describe, it, expect, vi } from "vitest";

import { UsageLogger } from "../../../src/core/usage/UsageLogger";

describe("UsageLogger", () => {

  it("logs the owner, request path and method", async () => {

    const repo = {
      create: vi.fn(async (_data: any) => undefined),
    };

    const logger = new UsageLogger(repo as any);

    const request = new Request("http://localhost/subscribe?foo=bar", {
      method: "POST",
    });

    await logger.log({ ownerId: "owner-1", request });

    expect(repo.create).toHaveBeenCalledTimes(1);

    const logged = repo.create.mock.calls[0][0] as any;

    expect(logged.ownerId).toBe("owner-1");
    expect(logged.path).toBe("/subscribe");
    expect(logged.method).toBe("POST");
    expect(logged.id).toBeTruthy();
    expect(logged.timestamp).toBeTruthy();
  });

});
