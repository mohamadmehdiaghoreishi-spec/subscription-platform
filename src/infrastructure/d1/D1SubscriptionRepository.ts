import { SubscriptionEntity } from "../../domain/repositories/SubscriptionRepository";

/**
 * D1-backed Subscription Repository
 * Cloudflare Workers D1 implementation
 */

export class D1SubscriptionRepository {
  constructor(private db: D1Database) {}

  async create(data: SubscriptionEntity): Promise<SubscriptionEntity> {
    await this.db.prepare(
      `INSERT INTO subscriptions (id, node, status, payload, createdAt)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      data.id,
      data.node,
      data.status,
      JSON.stringify(data.payload),
      data.createdAt
    )
    .run();

    return data;
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const result = await this.db.prepare(
      `SELECT * FROM subscriptions WHERE id = ?`
    )
    .bind(id)
    .first<any>();

    if (!result) return null;

    return {
      id: result.id,
      node: result.node,
      status: result.status,
      payload: JSON.parse(result.payload),
      createdAt: result.createdAt,
    };
  }

  async list(): Promise<SubscriptionEntity[]> {
    const result = await this.db.prepare(
      `SELECT * FROM subscriptions ORDER BY createdAt DESC`
    ).all<any>();

    return (result.results || []).map((r: any) => ({
      id: r.id,
      node: r.node,
      status: r.status,
      payload: JSON.parse(r.payload),
      createdAt: r.createdAt,
    }));
  }
}