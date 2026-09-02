import { SubscriptionEntity } from "../../domain/repositories/SubscriptionRepository";

export class D1SubscriptionRepository {

  constructor(
    private db: D1Database
  ) {}

  async create(
    data: SubscriptionEntity
  ): Promise<SubscriptionEntity> {

    await this.db.prepare(
`
INSERT INTO subscriptions
(
  id,
  ownerId,
  node,
  status,
  payload,
  createdAt
)
VALUES
(
  ?,
  ?,
  ?,
  ?,
  ?,
  ?
)
`
    )
    .bind(
      data.id,
      data.ownerId,
      data.node,
      data.status,
      JSON.stringify(data.payload),
      data.createdAt
    )
    .run();

    return data;

  }

  async findById(
    id: string
  ): Promise<SubscriptionEntity | null> {

    const result =
      await this.db.prepare(
`
SELECT *
FROM subscriptions
WHERE id = ?
`
      )
      .bind(id)
      .first<any>();

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      ownerId: result.ownerId,
      node: result.node,
      status: result.status,
      payload: JSON.parse(result.payload),
      createdAt: result.createdAt
    };

  }

  async findByOwnerId(
    ownerId: string
  ): Promise<SubscriptionEntity[]> {

    const result =
      await this.db.prepare(
`
SELECT *
FROM subscriptions
WHERE ownerId = ?
ORDER BY createdAt DESC
`
      )
      .bind(ownerId)
      .all<any>();

    return (result.results ?? []).map((row: any) => ({
      id: row.id,
      ownerId: row.ownerId,
      node: row.node,
      status: row.status,
      payload: JSON.parse(row.payload),
      createdAt: row.createdAt
    }));

  }

  async list(): Promise<SubscriptionEntity[]> {

    const result =
      await this.db.prepare(
`
SELECT *
FROM subscriptions
ORDER BY createdAt DESC
`
      )
      .all<any>();

    return (result.results ?? []).map((row: any) => ({
      id: row.id,
      ownerId: row.ownerId,
      node: row.node,
      status: row.status,
      payload: JSON.parse(row.payload),
      createdAt: row.createdAt
    }));

  }

  async updateStatus(
    id: string,
    status: string
  ): Promise<void> {

    await this.db.prepare(
`
UPDATE subscriptions
SET status = ?
WHERE id = ?
`
    )
    .bind(
      status,
      id
    )
    .run();

  }

}