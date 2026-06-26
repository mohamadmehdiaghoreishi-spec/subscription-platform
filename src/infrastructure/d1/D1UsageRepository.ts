import { UsageEntity } from "../../domain/entities/UsageEntity";

export class D1UsageRepository {

  constructor(
    private db: D1Database
  ) {}

  async create(
    data: UsageEntity
  ): Promise<void> {

    await this.db.prepare(
`
INSERT INTO usage
(
  id,
  ownerId,
  endpoint,
  createdAt
)
VALUES
(
  ?,
  ?,
  ?,
  ?
)
`
    )
    .bind(
      data.id,
      data.subscriptionId,
      data.path,
      data.timestamp
    )
    .run();

  }

  async countToday(
    ownerId: string
  ): Promise<number> {

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    const result =
      await this.db.prepare(
`
SELECT
  COUNT(*) as count
FROM usage
WHERE ownerId = ?
AND date(createdAt) = ?
`
      )
      .bind(
        ownerId,
        today
      )
      .first<{ count: number }>();

    return result?.count ?? 0;

  }

}