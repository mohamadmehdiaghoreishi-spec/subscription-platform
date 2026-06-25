import { BillingEntity } from "../../domain/entities/BillingEntity";

export class D1BillingRepository {

  constructor(private db: D1Database) {}

  async create(data: BillingEntity): Promise<void> {
    await this.db.prepare(
      `INSERT INTO billing
       (id, subscriptionId, usageCount, cost, periodStart, periodEnd, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      data.id,
      data.subscriptionId,
      data.usageCount,
      data.cost,
      data.periodStart,
      data.periodEnd,
      data.createdAt
    )
    .run();
  }

  async getBySubscription(subscriptionId: string) {
    return this.db.prepare(
      `SELECT * FROM billing WHERE subscriptionId = ? ORDER BY createdAt DESC`
    )
    .bind(subscriptionId)
    .all();
  }
}