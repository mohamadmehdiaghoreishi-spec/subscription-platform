import { UsageEntity } from "../../domain/entities/UsageEntity";

export class D1UsageRepository {

  constructor(private db: D1Database) {}

  async create(data: UsageEntity): Promise<void> {
    await this.db.prepare(
      `INSERT INTO usage (
        id,
        subscriptionId,
        endpoint,
        createdAt
      )
      VALUES (?, ?, ?, ?)`
    )
    .bind(
      data.id,
      data.subscriptionId,
      data.path,
      data.timestamp
    )
    .run();
  }


  async countToday(subscriptionId: string): Promise<number> {

    const today = new Date()
      .toISOString()
      .slice(0, 10);


    const result = await this.db.prepare(
      `SELECT COUNT(*) as count
       FROM usage
       WHERE subscriptionId = ?
       AND date(createdAt) = ?`
    )
    .bind(
      subscriptionId,
      today
    )
    .first<{ count: number }>();


    return result?.count ?? 0;
  }
}