import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";

import { D1ApiKeyRepository } from "../../src/infrastructure/d1/D1ApiKeyRepository";
import { resetDatabase } from "../helpers/db";

describe("D1ApiKeyRepository", () => {

  const repo = new D1ApiKeyRepository(env.DB);

  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates an api key and can find it back by key", async () => {

    const entity = {
      id: "key-1",
      key: "secret-key-1",
      ownerId: "owner-1",
      status: "active" as const,
      createdAt: new Date().toISOString(),
    };

    await repo.create(entity);

    const found = await repo.findByKey("secret-key-1");

    expect(found).toEqual(entity);
  });

  it("returns null for an unknown key", async () => {

    const found = await repo.findByKey("nope");

    expect(found).toBeNull();
  });

  it("lists keys scoped to a single owner, newest first", async () => {

    await repo.create({
      id: "key-2",
      key: "k2",
      ownerId: "owner-2",
      status: "active",
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    await repo.create({
      id: "key-3",
      key: "k3",
      ownerId: "owner-2",
      status: "active",
      createdAt: "2024-06-01T00:00:00.000Z",
    });

    await repo.create({
      id: "key-4",
      key: "k4",
      ownerId: "someone-else",
      status: "active",
      createdAt: "2024-12-01T00:00:00.000Z",
    });

    const keys = await repo.list("owner-2");

    expect(keys.map(k => k.id)).toEqual(["key-3", "key-2"]);
  });

  it("revokes a key so it's no longer active", async () => {

    await repo.create({
      id: "key-5",
      key: "k5",
      ownerId: "owner-5",
      status: "active",
      createdAt: new Date().toISOString(),
    });

    await repo.revoke("k5");

    const found = await repo.findByKey("k5");

    expect(found?.status).toBe("revoked");
  });

});
