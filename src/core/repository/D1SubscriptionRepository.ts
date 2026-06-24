export class D1SubscriptionRepository {
  constructor(private db: D1Database) {}

  async findActiveByUserId(userId: string) {
    return await this.db
      .prepare(
        `SELECT * FROM subscriptions 
         WHERE user_id = ? AND status = 'active'
         LIMIT 1`
      )
      .bind(userId)
      .first<any>();
  }

  async getActivePlan(userId: string): Promise<{
    plan: string;
    status: string;
    expires_at: string | null;
  } | null> {
    const result = await this.db
      .prepare(
        `SELECT plan, status, expires_at 
         FROM subscriptions 
         WHERE user_id = ? AND status = 'active'
         LIMIT 1`
      )
      .bind(userId)
      .first();

    return (result as any) ?? null;
  }

  async create(data: {
    user_id: string;
    plan: string;
    status: string;
    expires_at?: string | null;
  }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO subscriptions 
         (id, user_id, plan, status, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.user_id,
        data.plan,
        data.status,
        now,
        data.expires_at ?? null
      )
      .run();

    return {
      id,
      ...data,
      created_at: now,
    };
  }
}