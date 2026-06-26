import { D1UsageRepository } from "../../infrastructure/d1/D1UsageRepository";

export class UsageLogger {

  constructor(
    private repo: D1UsageRepository
  ) {}

  async log(input: {

    ownerId: string;

    request: Request;

  }) {

    await this.repo.create({

      id: crypto.randomUUID(),

      ownerId: input.ownerId,

      timestamp: new Date().toISOString(),

      path: new URL(input.request.url).pathname,

      method: input.request.method

    });

  }

}