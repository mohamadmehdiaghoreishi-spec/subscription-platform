import { describe, it, expect, vi } from "vitest";

import { ApiKeyService } from "../../../src/core/auth/ApiKeyService";

describe("ApiKeyService", () => {

  it("creates a new active api key for the given owner", async () => {

    const repo = {
      create: vi.fn(async (data: any) => data),
      list: vi.fn(async () => []),
      revoke: vi.fn(async () => undefined),
    };

    const service = new ApiKeyService(repo as any);

    const key = await service.create("owner-1");

    expect(key.ownerId).toBe("owner-1");
    expect(key.status).toBe("active");
    expect(key.key).toBeTruthy();
    expect(key.key.length).toBeGreaterThan(20);
  });

  it("generates a different key every time", async () => {

    const repo = {
      create: vi.fn(async (data: any) => data),
      list: vi.fn(async () => []),
      revoke: vi.fn(async () => undefined),
    };

    const service = new ApiKeyService(repo as any);

    const a = await service.create("owner-1");
    const b = await service.create("owner-1");

    expect(a.key).not.toBe(b.key);
  });

  it("list() delegates to repository.list()", async () => {

    const repo = {
      create: vi.fn(),
      list: vi.fn(async () => [{ id: "k1" }]),
      revoke: vi.fn(),
    };

    const service = new ApiKeyService(repo as any);

    const keys = await service.list("owner-1");

    expect(repo.list).toHaveBeenCalledWith("owner-1");
    expect(keys).toEqual([{ id: "k1" }]);
  });

  it("revoke() delegates to repository.revoke() when the caller owns the key", async () => {

    const repo = {
      create: vi.fn(),
      list: vi.fn(),
      findByKey: vi.fn(async () => ({ key: "some-key", ownerId: "owner-1" })),
      revoke: vi.fn(async () => undefined),
    };

    const service = new ApiKeyService(repo as any);

    await service.revoke("some-key", "owner-1");

    expect(repo.revoke).toHaveBeenCalledWith("some-key");
  });

  it("revoke() rejects when the caller does not own the key", async () => {

    const repo = {
      create: vi.fn(),
      list: vi.fn(),
      findByKey: vi.fn(async () => ({ key: "some-key", ownerId: "owner-1" })),
      revoke: vi.fn(async () => undefined),
    };

    const service = new ApiKeyService(repo as any);

    await expect(
      service.revoke("some-key", "owner-2")
    ).rejects.toThrow();

    expect(repo.revoke).not.toHaveBeenCalled();
  });

  it("revoke() rejects when the key does not exist", async () => {

    const repo = {
      create: vi.fn(),
      list: vi.fn(),
      findByKey: vi.fn(async () => null),
      revoke: vi.fn(async () => undefined),
    };

    const service = new ApiKeyService(repo as any);

    await expect(
      service.revoke("missing-key", "owner-1")
    ).rejects.toThrow();

    expect(repo.revoke).not.toHaveBeenCalled();
  });

});