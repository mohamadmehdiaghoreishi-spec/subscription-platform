export interface SubscriptionEntity {

  id: string;

  subscriptionId: string;

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

  updateStatus(
    id: string,
    status: string
  ): Promise<void>;

}