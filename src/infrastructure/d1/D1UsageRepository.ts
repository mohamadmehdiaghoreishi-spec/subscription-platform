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
      data.ownerId,
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

  async totalCount(
    ownerId: string
  ): Promise<number> {

    const result =
      await this.db.prepare(
`
SELECT
  COUNT(*) as count
FROM usage
WHERE ownerId = ?
`
      )
      .bind(ownerId)
      .first<{ count: number }>();

    return result?.count ?? 0;

  }

  async countByDay(
    ownerId: string,
    days: number
  ): Promise<{ date: string; count: number }[]> {

    const result =
      await this.db.prepare(
`
SELECT
  date(createdAt) as date,
  COUNT(*) as count
FROM usage
WHERE ownerId = ?
AND date(createdAt) >= date('now', ?)
GROUP BY date(createdAt)
ORDER BY date(createdAt) DESC
`
      )
      .bind(
        ownerId,
        `-${days} days`
      )
      .all<{ date: string; count: number }>();

    return result.results ?? [];

  }

  async countByPath(
    ownerId: string
  ): Promise<{ path: string; count: number }[]> {

    const result =
      await this.db.prepare(
`
SELECT
  endpoint as path,
  COUNT(*) as count
FROM usage
WHERE ownerId = ?
GROUP BY endpoint
ORDER BY count DESC
`
      )
      .bind(ownerId)
      .all<{ path: string; count: number }>();

    return result.results ?? [];

  }

}
