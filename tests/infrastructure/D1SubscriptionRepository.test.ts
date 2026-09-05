import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";

import { D1SubscriptionRepository } from "../../src/infrastructure/d1/D1SubscriptionRepository";
import { SubscriptionStatus } from "../../src/domain/entities/SubscriptionStatus";
import { resetDatabase } from "../helpers/db";

describe("D1SubscriptionRepository", () => {

  const repo = new D1SubscriptionRepository(env.DB);

  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates a subscription and returns it unchanged", async () => {

    const entity = {
      id: "sub-1",
      ownerId: "owner-1",
      node: "default",
      status: SubscriptionStatus.CREATED,
      payload: { plan: "FREE" },
      createdAt: new Date().toISOString(),
    };

    const created = await repo.create(entity);

    expect(created).toEqual(entity);
  });

  it("finds a subscription by its own primary key id", async () => {

    await repo.create({
      id: "sub-2",
      ownerId: "owner-2",
      node: "default",
      status: SubscriptionStatus.CREATED,
      payload: { hello: "world" },
      createdAt: new Date().toISOString(),
    });

    const found = await repo.findById("sub-2");

    expect(found?.ownerId).toBe("owner-2");
    expect(found?.payload).toEqual({ hello: "world" });
  });

  it("returns null when a subscription id doesn't exist", async () => {

    const found = await repo.findById("does-not-exist");

    expect(found).toBeNull();
  });

  it("finds all subscriptions belonging to an owner, newest first", async () => {

    await repo.create({
      id: "sub-3",
      ownerId: "owner-3",
      node: "default",
      status: SubscriptionStatus.CREATED,
      payload: {},
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    await repo.create({
      id: "sub-4",
      ownerId: "owner-3",
      node: "default",
      status: SubscriptionStatus.CREATED,
      payload: {},
      createdAt: "2024-06-01T00:00:00.000Z",
    });

    // belongs to a different owner - must not leak into owner-3's list
    await repo.create({
      id: "sub-5",
      ownerId: "someone-else",
      node: "default",
      status: SubscriptionStatus.CREATED,
      payload: {},
      createdAt: "2024-12-01T00:00:00.000Z",
    });

    const found = await repo.findByOwnerId("owner-3");

    expect(found.map(s => s.id)).toEqual(["sub-4", "sub-3"]);
  });

  it("lists every subscription regardless of owner", async () => {

    await repo.create({
      id: "sub-6",
      ownerId: "owner-a",
      node: "default",
      status: SubscriptionStatus.CREATED,
      payload: {},
      createdAt: new Date().toISOString(),
    });

    await repo.create({
      id: "sub-7",
      ownerId: "owner-b",
      node: "default",
      status: SubscriptionStatus.CREATED,
      payload: {},
      createdAt: new Date().toISOString(),
    });

    const all = await repo.list();

    expect(all.length).toBe(2);
  });

  it("updates status by primary key id", async () => {

    await repo.create({
      id: "sub-8",
      ownerId: "owner-8",
      node: "default",
      status: SubscriptionStatus.CREATED,
      payload: {},
      createdAt: new Date().toISOString(),
    });

    await repo.updateStatus("sub-8", SubscriptionStatus.ACTIVE);

    const updated = await repo.findById("sub-8");

    expect(updated?.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it("updateStatus does nothing (no error) when the id doesn't match any row", async () => {

    // This documents the current (buggy) contract: updateStatus only
    // matches on the row's own primary key "id", not "ownerId". Passing
    // an ownerId here — as ExecutorRegistry currently does — silently
    // updates zero rows instead of throwing or updating anything.
    await expect(
      repo.updateStatus("owner-does-not-exist-as-a-row-id", SubscriptionStatus.ACTIVE)
    ).resolves.toBeUndefined();

  });

});
