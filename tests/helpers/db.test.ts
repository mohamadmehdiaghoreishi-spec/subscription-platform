import { describe, it, beforeEach, expect } from "vitest";

import { env } from "cloudflare:test";

import { resetDatabase } from "./db";

describe("Database helper", () => {

  beforeEach(async () => {

    await resetDatabase();

  });

  it("plans table is seeded", async () => {

    const result =
      await env.DB.prepare(
`
SELECT COUNT(*) as count
FROM plans
`
      )
      .first<{ count:number }>();

    expect(result?.count).toBeGreaterThan(0);

  });

});