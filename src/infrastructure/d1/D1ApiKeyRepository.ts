export interface ApiKeyEntity {
  id: string;
  key: string;
  subscriptionId: string;
  status: "active" | "revoked";
  createdAt: string;
}

export class D1ApiKeyRepository {

  constructor(private db: D1Database) {}

  async create(data: ApiKeyEntity): Promise<ApiKeyEntity> {

    await this.db.prepare(
      `INSERT INTO api_keys (id, key, subscriptionId, status, createdAt)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      data.id,
      data.key,
      data.subscriptionId,
      data.status,
      data.createdAt
    )
    .run();

    return data;
  }

  async findByKey(key: string): Promise<ApiKeyEntity | null> {

    const result = await this.db.prepare(
      `SELECT * FROM api_keys WHERE key = ?`
    )
    .bind(key)
    .first<any>();

    if (!result) return null;

    return {
      id: result.id,
      key: result.key,
      subscriptionId: result.subscriptionId,
      status: result.status,
      createdAt: result.createdAt
    };
  }

  async list(subscriptionId: string): Promise<ApiKeyEntity[]> {

    const result = await this.db.prepare(
      `SELECT * FROM api_keys WHERE subscriptionId = ?`
    )
    .bind(subscriptionId)
    .all<any>();

    return (result.results || []).map((r: any) => ({
      id: r.id,
      key: r.key,
      subscriptionId: r.subscriptionId,
      status: r.status,
      createdAt: r.createdAt
    }));
  }

  async revoke(key: string): Promise<void> {

    await this.db.prepare(
      `UPDATE api_keys SET status = 'revoked' WHERE key = ?`
    )
    .bind(key)
    .run();
  }
}