// FILE: src/core/executor/ExecutorRegistry.ts
import { D1SubscriptionRepository } from "../../infrastructure/d1/D1SubscriptionRepository";
import { SubscriptionEntity } from "../../domain/repositories/SubscriptionRepository";
import { SubscriptionStatus } from "../../domain/entities/SubscriptionStatus";
import { SelectedNode } from "../routing/NodeSelector";
import { WorkerError, ErrorCode } from "../errors/WorkerError";
import { Logger } from "../logging/Logger";

export class ExecutorRegistry {

  constructor(
    private repository: D1SubscriptionRepository
  ) {}

  async createSubscription(
    ownerId: string,
    node: SelectedNode,
    payload: unknown
  ): Promise<SubscriptionEntity> {

    return {

      id: crypto.randomUUID(),

      ownerId,

      node: node.type,

      status: SubscriptionStatus.CREATED,

      payload,

      createdAt: new Date().toISOString()

    };

  }

  async persist(
    subscription: SubscriptionEntity
  ): Promise<SubscriptionEntity> {

    return this.repository.create(subscription);

  }

  async execute(
    node: SelectedNode,
    subscription: SubscriptionEntity
  ) {

    return {

      executed: true,

      node: node.type,

      subscriptionId: subscription.id

    };

  }

  async listSubscriptions(
    ownerId: string
  ): Promise<SubscriptionEntity[]> {

    return this.repository.findByOwnerId(
      ownerId
    );

  }

  async getSubscription(
    ownerId: string
  ): Promise<SubscriptionEntity | null> {

    const subscriptions =
      await this.repository.findByOwnerId(
        ownerId
      );

    return subscriptions[0] ?? null;

  }

  async cancelSubscription(
    ownerId: string
  ): Promise<SubscriptionEntity> {

    return this.setStatusByOwner(
      ownerId,
      SubscriptionStatus.CANCELED
    );

  }

  async activateSubscription(
    ownerId: string
  ): Promise<SubscriptionEntity> {

    return this.setStatusByOwner(
      ownerId,
      SubscriptionStatus.ACTIVE
    );

  }

  private async setStatusByOwner(
    ownerId: string,
    status: SubscriptionStatus
  ): Promise<SubscriptionEntity> {

    const subscriptions =
      await this.repository.findByOwnerId(
        ownerId
      );

    const current = subscriptions[0];

    if (!current) {

      throw new WorkerError({
        code: ErrorCode.NOT_FOUND,
        message: "Subscription not found"
      });

    }

    if (
      status === SubscriptionStatus.ACTIVE &&
      current.status === SubscriptionStatus.CANCELED
    ) {

      // A cancellation raced ahead of a payment verification that was
      // already in flight (e.g. the Zarinpal callback arriving after
      // the owner cancelled). We refuse to silently reactivate — that
      // needs a human decision (refund vs. honor the payment) — so we
      // just log it as a conflict and leave the subscription CANCELED.
      Logger.warn("subscription.activate.conflict_canceled", {
        ownerId,
        subscriptionId: current.id
      });

      return current;

    }

    await this.repository.updateStatus(
      current.id,
      status
    );

    return {
      ...current,
      status
    };

  }

}