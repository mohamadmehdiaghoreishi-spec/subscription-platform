export interface ApiKeyEntity {

  id: string;

  key: string;

  ownerId: string;

  status: "active" | "revoked";

  createdAt: string;

}

export class D1ApiKeyRepository {

  constructor(
    private db: D1Database
  ) {}

  async create(
    data: ApiKeyEntity
  ): Promise<ApiKeyEntity> {

    await this.db.prepare(
`
INSERT INTO api_keys
(
  id,
  key,
  ownerId,
  status,
  createdAt
)
VALUES
(
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
      data.key,
      data.ownerId,
      data.status,
      data.createdAt
    )
    .run();

    return data;

  }

  async findByKey(
    key: string
  ): Promise<ApiKeyEntity | null> {

    const result =
      await this.db.prepare(
`
SELECT *
FROM api_keys
WHERE key = ?
`
      )
      .bind(key)
      .first<any>();

    if (!result) {
      return null;
    }

    return {

      id: result.id,

      key: result.key,

      ownerId: result.ownerId,

      status: result.status,

      createdAt: result.createdAt

    };

  }

  async list(
    ownerId: string
  ): Promise<ApiKeyEntity[]> {

    const result =
      await this.db.prepare(
`
SELECT *
FROM api_keys
WHERE ownerId = ?
ORDER BY createdAt DESC
`
      )
      .bind(ownerId)
      .all<any>();

    return (result.results ?? []).map((row: any) => ({

      id: row.id,

      key: row.key,

      ownerId: row.ownerId,

      status: row.status,

      createdAt: row.createdAt

    }));

  }

  async revoke(
    key: string
  ): Promise<void> {

    await this.db.prepare(
`
UPDATE api_keys
SET status = 'revoked'
WHERE key = ?
`
    )
    .bind(key)
    .run();

  }

}