import { D1SubscriptionRepository } from "../../infrastructure/d1/D1SubscriptionRepository";
import { SubscriptionEntity } from "../../domain/repositories/SubscriptionRepository";
import { SubscriptionStatus } from "../../domain/entities/SubscriptionStatus";
import { SelectedNode } from "../routing/NodeSelector";
import { WorkerError, ErrorCode } from "../errors/WorkerError";

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

  async updateSubscriptionStatus(
    id: string,
    status: SubscriptionStatus
  ): Promise<void> {

    await this.repository.updateStatus(
      id,
      status
    );

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

    await this.repository.updateStatus(
      current.id,
      SubscriptionStatus.CANCELED
    );

    return {
      ...current,
      status: SubscriptionStatus.CANCELED
    };

  }

}