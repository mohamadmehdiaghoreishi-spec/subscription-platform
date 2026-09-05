import { describe, it, expect, vi } from "vitest";

import { ExecutorRegistry } from "../../../src/core/executor/ExecutorRegistry";
import { SubscriptionStatus } from "../../../src/domain/entities/SubscriptionStatus";
import { SelectedNode } from "../../../src/core/routing/NodeSelector";

function fakeRepo(overrides: Partial<Record<string, any>> = {}) {
  return {
    create: vi.fn(async (data: any) => data),
    findById: vi.fn(async () => null),
    findByOwnerId: vi.fn(async () => []),
    list: vi.fn(async () => []),
    updateStatus: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("ExecutorRegistry", () => {

  it("builds a new subscription entity in CREATED status for the given owner", async () => {

    const repo = fakeRepo();
    const executor = new ExecutorRegistry(repo as any);

    const node: SelectedNode = { type: "default", reason: "test" };
    const subscription = await executor.createSubscription("owner-1", node, { plan: "FREE" });

    expect(subscription.ownerId).toBe("owner-1");
    expect(subscription.status).toBe(SubscriptionStatus.CREATED);
    expect(subscription.node).toBe("default");
    expect(subscription.payload).toEqual({ plan: "FREE" });
    expect(subscription.id).toBeTruthy();
  });

  it("persist() delegates to repository.create()", async () => {

    const repo = fakeRepo();
    const executor = new ExecutorRegistry(repo as any);

    const subscription = {
      id: "sub-1",
      ownerId: "owner-1",
      node: "default",
      status: SubscriptionStatus.CREATED,
      payload: {},
      createdAt: new Date().toISOString(),
    };

    await executor.persist(subscription);

    expect(repo.create).toHaveBeenCalledWith(subscription);
  });

  it("listSubscriptions() delegates to repository.findByOwnerId()", async () => {

    const repo = fakeRepo({
      findByOwnerId: vi.fn(async () => [{ id: "sub-1", ownerId: "owner-1" }]),
    });
    const executor = new ExecutorRegistry(repo as any);

    const result = await executor.listSubscriptions("owner-1");

    expect(repo.findByOwnerId).toHaveBeenCalledWith("owner-1");
    expect(result).toEqual([{ id: "sub-1", ownerId: "owner-1" }]);
  });

  // BUG-004 (ROADMAP) is now fixed for these two methods: both look up
  // the row via findByOwnerId() instead of the old findById()/updateStatus()
  // which incorrectly filtered on the row's own primary key.

  it("getSubscription() looks a subscription up by ownerId (BUG-004, fixed)", async () => {

    const repo = fakeRepo({
      findByOwnerId: vi.fn(async (ownerId: string) => [
        { id: "sub-1", ownerId, node: "default", status: SubscriptionStatus.ACTIVE, payload: {}, createdAt: "now" },
      ]),
      findById: vi.fn(async () => null),
    });
    const executor = new ExecutorRegistry(repo as any);

    const result = await executor.getSubscription("owner-1");

    expect(result?.ownerId).toBe("owner-1");
    expect(repo.findByOwnerId).toHaveBeenCalledWith("owner-1");
  });

  it("cancelSubscription() looks up and cancels by ownerId, and 404s when there's nothing to cancel", async () => {

    const found = fakeRepo({
      findByOwnerId: vi.fn(async () => [
        { id: "sub-1", ownerId: "owner-1", node: "default", status: SubscriptionStatus.ACTIVE, payload: {}, createdAt: "now" },
      ]),
    });
    const executorFound = new ExecutorRegistry(found as any);

    const cancelled = await executorFound.cancelSubscription("owner-1");

    expect(cancelled.status).toBe(SubscriptionStatus.CANCELED);
    expect(found.updateStatus).toHaveBeenCalledWith("sub-1", SubscriptionStatus.CANCELED);

    const notFound = fakeRepo({ findByOwnerId: vi.fn(async () => []) });
    const executorNotFound = new ExecutorRegistry(notFound as any);

    await expect(executorNotFound.cancelSubscription("no-such-owner")).rejects.toThrow();
  });

  it("activateSubscription() looks up and activates by ownerId, and 404s when there's nothing to activate", async () => {

    const found = fakeRepo({
      findByOwnerId: vi.fn(async () => [
        { id: "sub-2", ownerId: "owner-2", node: "default", status: SubscriptionStatus.CREATED, payload: {}, createdAt: "now" },
      ]),
    });
    const executorFound = new ExecutorRegistry(found as any);

    const activated = await executorFound.activateSubscription("owner-2");

    expect(activated.status).toBe(SubscriptionStatus.ACTIVE);
    expect(found.updateStatus).toHaveBeenCalledWith("sub-2", SubscriptionStatus.ACTIVE);

    const notFound = fakeRepo({ findByOwnerId: vi.fn(async () => []) });
    const executorNotFound = new ExecutorRegistry(notFound as any);

    await expect(executorNotFound.activateSubscription("no-such-owner")).rejects.toThrow();
  });

});
