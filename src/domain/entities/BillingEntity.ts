export interface BillingEntity {
  id: string;
  subscriptionId: string;
  usageCount: number;
  cost: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}