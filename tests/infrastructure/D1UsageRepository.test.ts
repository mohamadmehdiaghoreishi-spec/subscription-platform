import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";

import { D1UsageRepository } from "../../src/infrastructure/d1/D1UsageRepository";
import { resetDatabase } from "../helpers/db";

describe("D1UsageRepository", () => {

  const repo = new D1UsageRepository(env.DB);

  beforeEach(async () => {
    await resetDatabase();
  });

  it("counts zero usage for an owner with no logged requests", async () => {

    const count = await repo.countToday("owner-1");

    expect(count).toBe(0);
  });

  it("counts only today's requests for the given owner", async () => {

    await repo.create({
      id: "u-1",
      ownerId: "owner-1",
      path: "/subscribe",
      method: "POST",
      timestamp: new Date().toISOString(),
    });

    await repo.create({
      id: "u-2",
      ownerId: "owner-1",
      path: "/sub",
      method: "GET",
      timestamp: new Date().toISOString(),
    });

    // a different owner's usage must not be counted
    await repo.create({
      id: "u-3",
      ownerId: "owner-2",
      path: "/sub",
      method: "GET",
      timestamp: new Date().toISOString(),
    });

    // a request from a previous day must not count towards "today"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await repo.create({
      id: "u-4",
      ownerId: "owner-1",
      path: "/sub",
      method: "GET",
      timestamp: yesterday.toISOString(),
    });

    const count = await repo.countToday("owner-1");

    expect(count).toBe(2);
  });

  it("totalCount() counts all-time requests regardless of date", async () => {

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await repo.create({ id: "u-5", ownerId: "owner-9", path: "/sub", method: "GET", timestamp: new Date().toISOString() });
    await repo.create({ id: "u-6", ownerId: "owner-9", path: "/sub", method: "GET", timestamp: yesterday.toISOString() });
    await repo.create({ id: "u-7", ownerId: "someone-else", path: "/sub", method: "GET", timestamp: new Date().toISOString() });

    expect(await repo.totalCount("owner-9")).toBe(2);
  });

  it("countByPath() groups usage by endpoint, most-used first", async () => {

    await repo.create({ id: "u-8", ownerId: "owner-10", path: "/subscribe", method: "POST", timestamp: new Date().toISOString() });
    await repo.create({ id: "u-9", ownerId: "owner-10", path: "/subscribe", method: "POST", timestamp: new Date().toISOString() });
    await repo.create({ id: "u-10", ownerId: "owner-10", path: "/sub", method: "GET", timestamp: new Date().toISOString() });

    const byPath = await repo.countByPath("owner-10");

    expect(byPath[0]).toEqual({ path: "/subscribe", count: 2 });
    expect(byPath[1]).toEqual({ path: "/sub", count: 1 });
  });

  it("countByDay() only includes days within the requested window", async () => {

    const tooOld = new Date();
    tooOld.setDate(tooOld.getDate() - 30);

    await repo.create({ id: "u-11", ownerId: "owner-11", path: "/sub", method: "GET", timestamp: new Date().toISOString() });
    await repo.create({ id: "u-12", ownerId: "owner-11", path: "/sub", method: "GET", timestamp: tooOld.toISOString() });

    const byDay = await repo.countByDay("owner-11", 7);
    const totalInWindow = byDay.reduce((sum, d) => sum + d.count, 0);

    expect(totalInWindow).toBe(1);
  });

});
