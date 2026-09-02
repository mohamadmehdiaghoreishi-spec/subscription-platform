import { D1SubscriptionRepository } from "../../infrastructure/d1/D1SubscriptionRepository";
import { SubscriptionEntity } from "../../domain/repositories/SubscriptionRepository";
import { SubscriptionStatus } from "../../domain/entities/SubscriptionStatus";
import { SelectedNode } from "../routing/NodeSelector";

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
    id: string
  ): Promise<SubscriptionEntity | null> {

    return this.repository.findById(
      id
    );

  }

}