export interface SubscriptionEntity {
  id: string;
  node: string;
  status: string;
  payload: unknown;
  createdAt: string;
}

export interface ISubscriptionRepository {

  create(
    data: SubscriptionEntity
  ): Promise<SubscriptionEntity>;

  findById(
    id: string
  ): Promise<SubscriptionEntity | null>;

  findBySubscriptionId(
    subscriptionId: string
  ): Promise<SubscriptionEntity[]>;

  list(): Promise<SubscriptionEntity[]>;

}