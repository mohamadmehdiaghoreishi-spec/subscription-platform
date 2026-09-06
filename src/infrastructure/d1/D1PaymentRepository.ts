// FILE: src/infrastructure/d1/D1PaymentRepository.ts

export interface ProcessedPaymentEntity {
  authority: string;
  ownerId: string;
  amount: number;
  refId: number | null;
  processedAt: string;
}

export interface PaymentIntentEntity {
  authority: string;
  ownerId: string;
  plan: string;
  createdAt: string;
}

export class D1PaymentRepository {

  constructor(
    private db: D1Database
  ) {}

  // -----------------------------------------------------------------
  // Processed payments (idempotency claim — see bug: double activation)
  // -----------------------------------------------------------------

  async findByAuthority(
    authority: string
  ): Promise<ProcessedPaymentEntity | null> {

    const result =
      await this.db.prepare(
`
SELECT *
FROM processed_payments
WHERE authority = ?
`
      )
      .bind(authority)
      .first<any>();

    if (!result) {
      return null;
    }

    return {
      authority: result.authority,
      ownerId: result.ownerId,
      amount: result.amount,
      refId: result.refId,
      processedAt: result.processedAt
    };

  }

  // Atomically claims this authority. Returns true if THIS call is the
  // one that claimed it (no prior row existed). Returns false if another
  // request already claimed/processed it — caller must NOT activate again.
  async tryClaim(
    data: ProcessedPaymentEntity
  ): Promise<boolean> {

    try {

      await this.db.prepare(
`
INSERT INTO processed_payments
(
  authority,
  ownerId,
  amount,
  refId,
  processedAt
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
        data.authority,
        data.ownerId,
        data.amount,
        data.refId,
        data.processedAt
      )
      .run();

      return true;

    } catch (err) {

      // PRIMARY KEY conflict on `authority` => already claimed.
      return false;

    }

  }

  // Compensating action: used when a claim succeeded but the activation
  // that followed it failed, so a retry can attempt processing again.
  async deleteByAuthority(
    authority: string
  ): Promise<void> {

    await this.db.prepare(
`
DELETE FROM processed_payments
WHERE authority = ?
`
    )
    .bind(authority)
    .run();

  }

  // -----------------------------------------------------------------
  // Payment intents (authority -> owner/plan binding created at
  // /billing/checkout time, read back at /payment/callback time so the
  // callback never has to trust the client-supplied ownerId/plan).
  // -----------------------------------------------------------------

  async saveIntent(
    data: PaymentIntentEntity
  ): Promise<void> {

    await this.db.prepare(
`
INSERT INTO payment_intents
(
  authority,
  ownerId,
  plan,
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
      data.authority,
      data.ownerId,
      data.plan,
      data.createdAt
    )
    .run();

  }

  async findIntentByAuthority(
    authority: string
  ): Promise<PaymentIntentEntity | null> {

    const result =
      await this.db.prepare(
`
SELECT *
FROM payment_intents
WHERE authority = ?
`
      )
      .bind(authority)
      .first<any>();

    if (!result) {
      return null;
    }

    return {
      authority: result.authority,
      ownerId: result.ownerId,
      plan: result.plan,
      createdAt: result.createdAt
    };

  }

}