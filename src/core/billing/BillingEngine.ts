import { D1UsageRepository } from "../../infrastructure/d1/D1UsageRepository";
import { D1BillingRepository } from "../../infrastructure/d1/D1BillingRepository";

export class BillingEngine {

  constructor(
    private usageRepo: D1UsageRepository,
    private billingRepo: D1BillingRepository
  ) {}

  async generateInvoice(subscriptionId: string) {

    const usage =
      await this.usageRepo.countToday(subscriptionId);

    // 💡 simple pricing model (MVP)
    const costPerRequest = 0.001;
    const cost = usage * costPerRequest;

    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 1);

    const invoice = {
      id: crypto.randomUUID(),
      subscriptionId,
      usageCount: usage,
      cost,
      periodStart: start.toISOString(),
      periodEnd: now.toISOString(),
      createdAt: now.toISOString()
    };

    await this.billingRepo.create(invoice);

    return invoice;
  }
}