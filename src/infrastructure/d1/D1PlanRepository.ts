import { PlanType } from "../../core/plans/PlanTypes";

export class D1PlanRepository {

  constructor(
    private db: D1Database
  ) {}

  async getBySubscription(
    subscriptionId: string
  ): Promise<PlanType> {

    const result =
      await this.db.prepare(
`
SELECT
  p.name
FROM subscription_plans sp
JOIN plans p
ON p.id = sp.planId
WHERE sp.subscriptionId = ?
ORDER BY sp.createdAt DESC
LIMIT 1
`
      )
      .bind(subscriptionId)
      .first<any>();

    if (!result) {
      return PlanType.FREE;
    }

    return result.name as PlanType;
  }

  async assign(
    subscriptionId: string,
    plan: PlanType
  ): Promise<void> {

    const planResult =
      await this.db.prepare(
`
SELECT
  id
FROM plans
WHERE name = ?
`
      )
      .bind(plan)
      .first<any>();

    if (!planResult) {
      throw new Error("Plan not found");
    }

    const existing =
      await this.db.prepare(
`
SELECT
  id
FROM subscription_plans
WHERE subscriptionId = ?
LIMIT 1
`
      )
      .bind(subscriptionId)
      .first<any>();

    if (existing) {

      await this.db.prepare(
`
UPDATE subscription_plans
SET
  planId = ?,
  createdAt = ?
WHERE subscriptionId = ?
`
      )
      .bind(
        planResult.id,
        new Date().toISOString(),
        subscriptionId
      )
      .run();

      return;
    }

    await this.db.prepare(
`
INSERT INTO subscription_plans
(
  id,
  subscriptionId,
  planId,
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
      crypto.randomUUID(),
      subscriptionId,
      planResult.id,
      new Date().toISOString()
    )
    .run();
  }

}