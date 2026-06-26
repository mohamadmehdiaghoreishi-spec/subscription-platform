import { describe, expect, it } from "vitest";
import { AuthGuard } from "../../../src/core/auth/AuthGuard";

describe("AuthGuard", () => {

  it("throws when api key is missing", async () => {

    const repository = {
      findByKey: async () => null
    };

    const guard = new AuthGuard(repository as any);

    const request = new Request("http://localhost/test");

    await expect(
      guard.authenticate(request)
    ).rejects.toThrow();

  });

  it("returns authenticated context", async () => {

    const repository = {

      findByKey: async () => ({

        key: "abc",

        ownerId: "owner-1",

        status: "active"

      })

    };

    const guard = new AuthGuard(repository as any);

    const request = new Request("http://localhost/test", {

      headers: {

        "x-api-key": "abc"

      }

    });

    const result = await guard.authenticate(request);

    expect(result.apiKey).toBe("abc");

    expect(result.ownerId).toBe("owner-1");

  });

});