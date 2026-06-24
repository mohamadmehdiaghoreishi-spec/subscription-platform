/**
 * SubscriptionRepository
 *
 * Abstract repository for subscription persistence.
 * Future implementation: Cloudflare D1
 */

export interface SubscriptionEntity {
  id: string;
  node: string;
  status: string;
  payload: unknown;
  createdAt: string;
}

export interface ISubscriptionRepository {
  create(data: SubscriptionEntity): Promise<SubscriptionEntity>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  list(): Promise<SubscriptionEntity[]>;
}

/**
 * In-memory implementation (MVP)
 * Replace with D1 implementation later
 */
export class SubscriptionRepository implements ISubscriptionRepository {
  private store: Map<string, SubscriptionEntity> = new Map();

  async create(data: SubscriptionEntity): Promise<SubscriptionEntity> {
    this.store.set(data.id, data);
    return data;
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    return this.store.get(id) ?? null;
  }

  async list(): Promise<SubscriptionEntity[]> {
    return Array.from(this.store.values());
  }
}